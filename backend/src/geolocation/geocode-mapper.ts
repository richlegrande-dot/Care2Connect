import axios from 'axios';
import logger from '../config/logger';
import { PrismaClient } from '@prisma/client';
import type { ClassifiedResource } from '../ai/resource-classifier';

const prisma = new PrismaClient();

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  city: string;
  state: string;
  zipCode?: string;
  county?: string;
  accuracy: GeocodeAccuracy;
  provider: GeocodeProvider;
}

export interface GeocodedResource extends ClassifiedResource {
  geolocation: GeolocationResult;
  serviceRadius: number; // in meters
  geoQuality: GeoQualityScore;
  geoMetadata: GeoMetadata;
}

export enum GeocodeAccuracy {
  ROOFTOP = 'rooftop',
  RANGE_INTERPOLATED = 'range_interpolated',
  GEOMETRIC_CENTER = 'geometric_center', 
  APPROXIMATE = 'approximate',
  CITY_LEVEL = 'city_level',
  FAILED = 'failed'
}

export enum GeocodeProvider {
  NOMINATIM = 'nominatim',
  GOOGLE_MAPS = 'google_maps',
  CENSUS_GEOCODER = 'census_geocoder',
  CACHED = 'cached'
}

export enum GeoQualityScore {
  EXCELLENT = 'excellent',   // Rooftop accuracy, verified address
  GOOD = 'good',            // Street-level accuracy  
  ACCEPTABLE = 'acceptable', // Neighborhood/ZIP accuracy
  POOR = 'poor',            // City-level accuracy
  FAILED = 'failed'         // Geocoding failed
}

export interface GeoMetadata {
  geocodedAt: Date;
  provider: GeocodeProvider;
  accuracy: GeocodeAccuracy;
  confidenceScore: number;
  originalAddress: string;
  normalizedAddress: string;
  fallbackUsed: boolean;
  apiResponseTime: number;
  qualityFlags: string[];
}

// Service radius defaults by category (in meters)
const CATEGORY_SERVICE_RADIUS: Record<string, number> = {
  'food_nutrition': 5000,        // 5km - people travel for food banks
  'shelter_housing': 15000,      // 15km - housing has wider catchment
  'healthcare': 10000,           // 10km - medical services
  'mental_health': 8000,         // 8km - therapy/counseling
  'addiction_recovery': 20000,   // 20km - specialized treatment
  'legal_aid': 25000,           // 25km - limited legal aid locations
  'employment': 15000,          // 15km - job services
  'education_training': 10000,   // 10km - training programs
  'transportation': 3000,       // 3km - local transit hubs
  'crisis_emergency': 50000,    // 50km - crisis services serve wide areas
  'financial_assistance': 12000, // 12km - benefits offices
  'clothing_personal': 4000,    // 4km - clothing banks
  'veterans_services': 30000,   // 30km - specialized vet services
  'case_management': 8000,      // 8km - local case managers
  'information_referral': 25000, // 25km - 211 services are regional
  'other': 8000                 // 8km - default radius
};

export class GeolocationMapper {
  private geocodeCache = new Map<string, GeolocationResult>();
  private rateLimits = {
    nominatim: { requests: 0, resetTime: Date.now() + 3600000 }, // 1/second, reset hourly
    google: { requests: 0, resetTime: Date.now() + 86400000 }    // Daily limit tracking
  };

  async geocodeUnmappedResources(limit: number = 100): Promise<GeocodedResource[]> {
    logger.info(`Starting geocoding of up to ${limit} unmapped resources`);

    // Get classified resources without geolocation
    const unmappedResources = await prisma.classifiedResource.findMany({
      where: {
        geocodedResource: null, // No existing geocoding
        address: { not: '' }    // Must have address
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    if (unmappedResources.length === 0) {
      logger.info('No unmapped resources found');
      return [];
    }

    logger.info(`Found ${unmappedResources.length} resources to geocode`);

    const geocodedResources: GeocodedResource[] = [];

    for (const resource of unmappedResources) {
      try {
        const geocoded = await this.geocodeResource(resource);
        if (geocoded) {
          geocodedResources.push(geocoded);
          await this.saveGeocodedResource(geocoded);
        }

        // Rate limiting - 1 second between requests for Nominatim
        await this.delay(1100);

      } catch (error) {
        logger.error(`Geocoding failed for resource ${resource.id}`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          address: resource.address
        });
      }
    }

    logger.info(`Geocoding complete: ${geocodedResources.length} resources mapped`);
    return geocodedResources;
  }

  async geocodeResource(resource: ClassifiedResource): Promise<GeocodedResource | null> {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cacheKey = this.normalizeAddress(resource.address);
      if (this.geocodeCache.has(cacheKey)) {
        const cached = this.geocodeCache.get(cacheKey)!;
        return this.createGeocodedResource(resource, cached, true);
      }

      // Try geocoding with fallback providers
      let geolocation = await this.tryNominatimGeocode(resource.address);
      let fallbackUsed = false;

      if (!geolocation && process.env.GOOGLE_MAPS_API_KEY) {
        geolocation = await this.tryGoogleGeocode(resource.address);
        fallbackUsed = true;
      }

      if (!geolocation) {
        geolocation = await this.tryCensusGeocode(resource.address);
        fallbackUsed = true;
      }

      if (!geolocation) {
        logger.warn(`Geocoding failed for: ${resource.address}`);
        return null;
      }

      // Cache successful result
      this.geocodeCache.set(cacheKey, geolocation);

      // Create geocoded resource
      const geocoded = this.createGeocodedResource(resource, geolocation, fallbackUsed);
      geocoded.geoMetadata.apiResponseTime = Date.now() - startTime;

      return geocoded;

    } catch (error) {
      logger.error(`Geocoding error for ${resource.id}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        address: resource.address
      });
      return null;
    }
  }

  private async tryNominatimGeocode(address: string): Promise<GeolocationResult | null> {
    try {
      // Rate limit check (1 request per second)
      if (this.rateLimits.nominatim.requests >= 3600 && Date.now() < this.rateLimits.nominatim.resetTime) {
        logger.warn('Nominatim rate limit exceeded');
        return null;
      }

      if (Date.now() >= this.rateLimits.nominatim.resetTime) {
        this.rateLimits.nominatim.requests = 0;
        this.rateLimits.nominatim.resetTime = Date.now() + 3600000;
      }

      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          limit: 1,
          addressdetails: 1,
          countrycodes: 'us' // Limit to US addresses
        },
        headers: {
          'User-Agent': 'CareConnect-ResourceMapper/1.0'
        },
        timeout: 10000
      });

      this.rateLimits.nominatim.requests++;

      const results = response.data;
      if (!results || results.length === 0) {
        return null;
      }

      const result = results[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        formattedAddress: result.display_name,
        city: result.address?.city || result.address?.town || result.address?.village || '',
        state: result.address?.state || '',
        zipCode: result.address?.postcode,
        county: result.address?.county,
        accuracy: this.mapNominatimAccuracy(result.class, result.type),
        provider: GeocodeProvider.NOMINATIM
      };

    } catch (error) {
      logger.error('Nominatim geocoding failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        address
      });
      return null;
    }
  }

  private async tryGoogleGeocode(address: string): Promise<GeolocationResult | null> {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      return null;
    }

    try {
      // Basic rate limiting for Google API
      if (this.rateLimits.google.requests >= 2500) { // Conservative daily limit
        logger.warn('Google Geocoding API daily limit approached');
        return null;
      }

      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: address,
          key: process.env.GOOGLE_MAPS_API_KEY,
          region: 'us'
        },
        timeout: 10000
      });

      this.rateLimits.google.requests++;

      const results = response.data.results;
      if (!results || results.length === 0) {
        return null;
      }

      const result = results[0];
      const location = result.geometry.location;
      const addressComponents = result.address_components;

      return {
        latitude: location.lat,
        longitude: location.lng,
        formattedAddress: result.formatted_address,
        city: this.extractAddressComponent(addressComponents, 'locality'),
        state: this.extractAddressComponent(addressComponents, 'administrative_area_level_1'),
        zipCode: this.extractAddressComponent(addressComponents, 'postal_code'),
        county: this.extractAddressComponent(addressComponents, 'administrative_area_level_2'),
        accuracy: this.mapGoogleAccuracy(result.geometry.location_type),
        provider: GeocodeProvider.GOOGLE_MAPS
      };

    } catch (error) {
      logger.error('Google geocoding failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        address
      });
      return null;
    }
  }

  private async tryCensusGeocode(address: string): Promise<GeolocationResult | null> {
    try {
      const response = await axios.get('https://geocoding.geo.census.gov/geocoder/locations/onelineaddress', {
        params: {
          address: address,
          benchmark: 'Public_AR_Current',
          format: 'json'
        },
        timeout: 15000
      });

      const matches = response.data?.result?.addressMatches;
      if (!matches || matches.length === 0) {
        return null;
      }

      const match = matches[0];
      const coords = match.coordinates;
      const addressComponents = match.addressComponents;

      return {
        latitude: coords.y,
        longitude: coords.x,
        formattedAddress: match.matchedAddress,
        city: addressComponents.city || '',
        state: addressComponents.state || '',
        zipCode: addressComponents.zip,
        county: addressComponents.county,
        accuracy: GeocodeAccuracy.RANGE_INTERPOLATED, // Census typically provides street-level
        provider: GeocodeProvider.CENSUS_GEOCODER
      };

    } catch (error) {
      logger.error('Census geocoding failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        address
      });
      return null;
    }
  }

  private createGeocodedResource(
    resource: ClassifiedResource, 
    geolocation: GeolocationResult, 
    fallbackUsed: boolean = false
  ): GeocodedResource {
    const serviceRadius = this.calculateServiceRadius(resource.category, geolocation.accuracy);
    const geoQuality = this.calculateGeoQuality(geolocation);
    
    return {
      ...resource,
      geolocation,
      serviceRadius,
      geoQuality,
      geoMetadata: {
        geocodedAt: new Date(),
        provider: geolocation.provider,
        accuracy: geolocation.accuracy,
        confidenceScore: this.calculateConfidenceScore(geolocation),
        originalAddress: resource.address,
        normalizedAddress: this.normalizeAddress(resource.address),
        fallbackUsed,
        apiResponseTime: 0, // Will be set by caller
        qualityFlags: this.generateQualityFlags(geolocation, resource.address)
      }
    };
  }

  private calculateServiceRadius(category: string, accuracy: GeocodeAccuracy): number {
    const baseRadius = CATEGORY_SERVICE_RADIUS[category] || CATEGORY_SERVICE_RADIUS.other;
    
    // Adjust radius based on geocoding accuracy
    switch (accuracy) {
      case GeocodeAccuracy.ROOFTOP:
        return baseRadius;
      case GeocodeAccuracy.RANGE_INTERPOLATED:
        return baseRadius * 1.1;
      case GeocodeAccuracy.GEOMETRIC_CENTER:
        return baseRadius * 1.3;
      case GeocodeAccuracy.APPROXIMATE:
        return baseRadius * 1.5;
      case GeocodeAccuracy.CITY_LEVEL:
        return baseRadius * 2.0;
      default:
        return baseRadius;
    }
  }

  private calculateGeoQuality(geolocation: GeolocationResult): GeoQualityScore {
    switch (geolocation.accuracy) {
      case GeocodeAccuracy.ROOFTOP:
        return GeoQualityScore.EXCELLENT;
      case GeocodeAccuracy.RANGE_INTERPOLATED:
        return GeoQualityScore.GOOD;
      case GeocodeAccuracy.GEOMETRIC_CENTER:
        return GeoQualityScore.ACCEPTABLE;
      case GeocodeAccuracy.APPROXIMATE:
        return GeoQualityScore.POOR;
      case GeocodeAccuracy.CITY_LEVEL:
      case GeocodeAccuracy.FAILED:
        return GeoQualityScore.FAILED;
      default:
        return GeoQualityScore.POOR;
    }
  }

  private calculateConfidenceScore(geolocation: GeolocationResult): number {
    let score = 50; // Base score

    // Accuracy bonus
    switch (geolocation.accuracy) {
      case GeocodeAccuracy.ROOFTOP:
        score += 40;
        break;
      case GeocodeAccuracy.RANGE_INTERPOLATED:
        score += 30;
        break;
      case GeocodeAccuracy.GEOMETRIC_CENTER:
        score += 20;
        break;
      case GeocodeAccuracy.APPROXIMATE:
        score += 10;
        break;
      case GeocodeAccuracy.CITY_LEVEL:
        score += 5;
        break;
    }

    // Provider reliability bonus
    switch (geolocation.provider) {
      case GeocodeProvider.GOOGLE_MAPS:
        score += 10;
        break;
      case GeocodeProvider.CENSUS_GEOCODER:
        score += 8;
        break;
      case GeocodeProvider.NOMINATIM:
        score += 5;
        break;
      case GeocodeProvider.CACHED:
        // No additional bonus for cached
        break;
    }

    return Math.min(100, Math.max(0, score));
  }

  private generateQualityFlags(geolocation: GeolocationResult, originalAddress: string): string[] {
    const flags: string[] = [];

    if (geolocation.accuracy === GeocodeAccuracy.CITY_LEVEL) {
      flags.push('city_level_only');
    }

    if (geolocation.accuracy === GeocodeAccuracy.APPROXIMATE) {
      flags.push('approximate_location');
    }

    if (!geolocation.zipCode) {
      flags.push('missing_zipcode');
    }

    if (!originalAddress.match(/\d+/)) {
      flags.push('no_street_number');
    }

    const normalizedOriginal = this.normalizeAddress(originalAddress);
    const normalizedFormatted = this.normalizeAddress(geolocation.formattedAddress);
    
    if (!normalizedFormatted.includes(normalizedOriginal.split(',')[0])) {
      flags.push('address_mismatch');
    }

    return flags;
  }

  // Address normalization and utility methods
  private normalizeAddress(address: string): string {
    return address
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s,]/g, '')
      .trim();
  }

  private mapNominatimAccuracy(osmClass: string, osmType: string): GeocodeAccuracy {
    if (osmClass === 'building' || osmType === 'house') {
      return GeocodeAccuracy.ROOFTOP;
    }
    if (osmClass === 'highway' && osmType === 'residential') {
      return GeocodeAccuracy.RANGE_INTERPOLATED;
    }
    if (osmClass === 'place' && ['suburb', 'neighbourhood'].includes(osmType)) {
      return GeocodeAccuracy.GEOMETRIC_CENTER;
    }
    if (osmClass === 'place' && osmType === 'city') {
      return GeocodeAccuracy.CITY_LEVEL;
    }
    return GeocodeAccuracy.APPROXIMATE;
  }

  private mapGoogleAccuracy(locationType: string): GeocodeAccuracy {
    switch (locationType) {
      case 'ROOFTOP':
        return GeocodeAccuracy.ROOFTOP;
      case 'RANGE_INTERPOLATED':
        return GeocodeAccuracy.RANGE_INTERPOLATED;
      case 'GEOMETRIC_CENTER':
        return GeocodeAccuracy.GEOMETRIC_CENTER;
      case 'APPROXIMATE':
        return GeocodeAccuracy.APPROXIMATE;
      default:
        return GeocodeAccuracy.APPROXIMATE;
    }
  }

  private extractAddressComponent(components: any[], type: string): string {
    const component = components.find(c => c.types.includes(type));
    return component?.long_name || '';
  }

  private async saveGeocodedResource(resource: GeocodedResource): Promise<void> {
    try {
      await prisma.geocodedResource.upsert({
        where: { 
          classifiedResourceId: resource.id 
        },
        update: {
          latitude: resource.geolocation.latitude,
          longitude: resource.geolocation.longitude,
          formattedAddress: resource.geolocation.formattedAddress,
          city: resource.geolocation.city,
          state: resource.geolocation.state,
          zipCode: resource.geolocation.zipCode,
          county: resource.geolocation.county,
          accuracy: resource.geolocation.accuracy,
          provider: resource.geolocation.provider,
          serviceRadius: resource.serviceRadius,
          geoQuality: resource.geoQuality,
          geoMetadata: resource.geoMetadata,
          updatedAt: new Date()
        },
        create: {
          id: `geo-${resource.id}`,
          classifiedResourceId: resource.id,
          latitude: resource.geolocation.latitude,
          longitude: resource.geolocation.longitude,
          formattedAddress: resource.geolocation.formattedAddress,
          city: resource.geolocation.city,
          state: resource.geolocation.state,
          zipCode: resource.geolocation.zipCode,
          county: resource.geolocation.county,
          accuracy: resource.geolocation.accuracy,
          provider: resource.geolocation.provider,
          serviceRadius: resource.serviceRadius,
          geoQuality: resource.geoQuality,
          geoMetadata: resource.geoMetadata,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      logger.debug(`Saved geocoded resource: ${resource.name} at (${resource.geolocation.latitude}, ${resource.geolocation.longitude})`);
    } catch (error) {
      logger.error(`Failed to save geocoded resource ${resource.id}`, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Batch processing methods
  async batchGeocode(batchSize: number = 50): Promise<void> {
    logger.info('Starting batch geocoding process');
    
    let totalProcessed = 0;
    let hasMoreResources = true;

    while (hasMoreResources) {
      const geocoded = await this.geocodeUnmappedResources(batchSize);
      
      if (geocoded.length === 0) {
        hasMoreResources = false;
      } else {
        totalProcessed += geocoded.length;
        logger.info(`Batch complete: ${geocoded.length} resources geocoded (total: ${totalProcessed})`);
        
        // Longer pause between batches to respect rate limits
        await this.delay(10000);
      }
    }

    logger.info(`Batch geocoding complete: ${totalProcessed} total resources processed`);
  }

  // Quality improvement methods
  async improveGeocodingQuality(): Promise<void> {
    logger.info('Starting geocoding quality improvement process');

    // Re-geocode resources with poor quality scores
    const poorQualityResources = await prisma.geocodedResource.findMany({
      where: {
        OR: [
          { geoQuality: GeoQualityScore.POOR },
          { geoQuality: GeoQualityScore.FAILED },
          { accuracy: GeocodeAccuracy.CITY_LEVEL }
        ]
      },
      include: {
        classifiedResource: true
      },
      take: 50 // Limit to control API usage
    });

    logger.info(`Found ${poorQualityResources.length} resources with poor geocoding quality`);

    for (const geoResource of poorQualityResources) {
      try {
        // Try different geocoding approach or enhanced address
        const improved = await this.geocodeResource(geoResource.classifiedResource);
        
        if (improved && this.isImprovedGeocoding(geoResource, improved)) {
          await this.saveGeocodedResource(improved);
          logger.info(`Improved geocoding for ${geoResource.classifiedResource.name}`);
        }

        await this.delay(2000);
      } catch (error) {
        logger.error(`Quality improvement failed for ${geoResource.id}`, {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private isImprovedGeocoding(current: any, improved: GeocodedResource): boolean {
    const currentQualityScore = this.getQualityScore(current.geoQuality);
    const improvedQualityScore = this.getQualityScore(improved.geoQuality);
    
    return improvedQualityScore > currentQualityScore;
  }

  private getQualityScore(quality: GeoQualityScore): number {
    switch (quality) {
      case GeoQualityScore.EXCELLENT: return 5;
      case GeoQualityScore.GOOD: return 4;
      case GeoQualityScore.ACCEPTABLE: return 3;
      case GeoQualityScore.POOR: return 2;
      case GeoQualityScore.FAILED: return 1;
      default: return 0;
    }
  }

  // Statistics and monitoring
  async getGeocodingStats(): Promise<any> {
    const totalGeocoded = await prisma.geocodedResource.count();
    
    const qualityStats = await prisma.geocodedResource.groupBy({
      by: ['geoQuality'],
      _count: { id: true }
    });

    const providerStats = await prisma.geocodedResource.groupBy({
      by: ['provider'],
      _count: { id: true }
    });

    const accuracyStats = await prisma.geocodedResource.groupBy({
      by: ['accuracy'],
      _count: { id: true }
    });

    const recentlyGeocoded = await prisma.geocodedResource.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    return {
      totalGeocoded,
      recentlyGeocoded,
      qualityDistribution: qualityStats,
      providerDistribution: providerStats,
      accuracyDistribution: accuracyStats,
      cacheSize: this.geocodeCache.size
    };
  }
}

// Export singleton instance
export const geolocationMapper = new GeolocationMapper();
