import logger from '../config/logger';
import { PrismaClient } from '@prisma/client';
import type { GeocodedResource } from '../geolocation/geocode-mapper';
import { ResourceCategory, TargetGroup } from '../ai/resource-classifier';

const prisma = new PrismaClient();

export interface RankedResource extends GeocodedResource {
  overallScore: number;
  rankingScores: RankingScores;
  rankingMetadata: RankingMetadata;
  priorityLevel: PriorityLevel;
}

export interface RankingScores {
  availabilityScore: number;    // 0-100: Hours of operation, current status
  accessibilityScore: number;   // 0-100: Transportation, disability access
  capacityScore: number;        // 0-100: Wait times, bed availability
  qualityScore: number;         // 0-100: Reviews, accreditation, outcomes
  urgencyScore: number;         // 0-100: Crisis services, emergency access
  populationScore: number;      // 0-100: Match with target demographics
  proximityScore: number;       // 0-100: Distance weighting
  reliabilityScore: number;     // 0-100: Consistent services, funding stability
}

export interface RankingMetadata {
  calculatedAt: Date;
  algorithmVersion: string;
  weightingProfile: WeightingProfile;
  contextFactors: string[];
  dataFreshness: number;        // Days since last update
  confidenceLevel: number;      // Overall ranking confidence (0-100)
  qualityFlags: string[];
}

export enum PriorityLevel {
  CRITICAL = 'critical',       // Emergency services, crisis intervention
  HIGH = 'high',              // Immediate needs, high-impact services
  MEDIUM = 'medium',          // Standard community services
  LOW = 'low',               // Supplementary or specialized services
  INACTIVE = 'inactive'       // Closed, suspended, or unverified services
}

export enum WeightingProfile {
  CRISIS = 'crisis',           // Prioritize emergency/crisis services
  BASIC_NEEDS = 'basic_needs', // Food, shelter, immediate survival
  COMPREHENSIVE = 'comprehensive', // Holistic service delivery
  SPECIALIZED = 'specialized', // Targeted population services
  GEOGRAPHIC = 'geographic',   // Location-based prioritization
  QUALITY_FOCUSED = 'quality_focused' // Highest quality services first
}

// Weighting configurations for different scenarios
const WEIGHTING_PROFILES: Record<WeightingProfile, Partial<RankingScores>> = {
  [WeightingProfile.CRISIS]: {
    urgencyScore: 35,
    availabilityScore: 25,
    accessibilityScore: 20,
    proximityScore: 15,
    reliabilityScore: 5
  },
  [WeightingProfile.BASIC_NEEDS]: {
    availabilityScore: 30,
    proximityScore: 25,
    accessibilityScore: 20,
    capacityScore: 15,
    reliabilityScore: 10
  },
  [WeightingProfile.COMPREHENSIVE]: {
    qualityScore: 25,
    availabilityScore: 20,
    accessibilityScore: 15,
    populationScore: 15,
    proximityScore: 15,
    reliabilityScore: 10
  },
  [WeightingProfile.SPECIALIZED]: {
    populationScore: 35,
    qualityScore: 25,
    availabilityScore: 20,
    proximityScore: 15,
    reliabilityScore: 5
  },
  [WeightingProfile.GEOGRAPHIC]: {
    proximityScore: 40,
    availabilityScore: 25,
    accessibilityScore: 20,
    capacityScore: 15
  },
  [WeightingProfile.QUALITY_FOCUSED]: {
    qualityScore: 40,
    reliabilityScore: 25,
    availabilityScore: 20,
    populationScore: 15
  }
};

// Priority scoring by resource category
const CATEGORY_PRIORITY_WEIGHTS: Record<ResourceCategory, number> = {
  [ResourceCategory.CRISIS_EMERGENCY]: 100,
  [ResourceCategory.SHELTER_HOUSING]: 95,
  [ResourceCategory.FOOD_NUTRITION]: 90,
  [ResourceCategory.HEALTHCARE]: 85,
  [ResourceCategory.MENTAL_HEALTH]: 80,
  [ResourceCategory.ADDICTION_RECOVERY]: 80,
  [ResourceCategory.DOMESTIC_VIOLENCE]: 95,
  [ResourceCategory.HUMAN_TRAFFICKING]: 100,
  [ResourceCategory.VETERANS_SERVICES]: 75,
  [ResourceCategory.DISABILITY_SERVICES]: 75,
  [ResourceCategory.LEGAL_AID]: 70,
  [ResourceCategory.FINANCIAL_ASSISTANCE]: 70,
  [ResourceCategory.EMPLOYMENT]: 65,
  [ResourceCategory.EDUCATION_TRAINING]: 60,
  [ResourceCategory.TRANSPORTATION]: 65,
  [ResourceCategory.CLOTHING_PERSONAL]: 55,
  [ResourceCategory.COMMUNICATION_TECH]: 50,
  [ResourceCategory.DOCUMENTATION_ID]: 60,
  [ResourceCategory.WOMEN_SERVICES]: 75,
  [ResourceCategory.CHILDREN_YOUTH]: 85,
  [ResourceCategory.SENIORS_ELDERLY]: 75,
  [ResourceCategory.LGBTQ_SERVICES]: 75,
  [ResourceCategory.IMMIGRANT_REFUGEE]: 75,
  [ResourceCategory.CASE_MANAGEMENT]: 70,
  [ResourceCategory.ADVOCACY]: 60,
  [ResourceCategory.INFORMATION_REFERRAL]: 55,
  [ResourceCategory.OTHER]: 50
};

export class ResourceRanking {
  private algorithmVersion = '2.1';
  
  async rankUnrankedResources(
    limit: number = 200, 
    weightingProfile: WeightingProfile = WeightingProfile.COMPREHENSIVE
  ): Promise<RankedResource[]> {
    logger.info(`Starting ranking of up to ${limit} resources with ${weightingProfile} profile`);

    // Get geocoded resources without ranking
    const unrankedResources = await prisma.geocodedResource.findMany({
      where: {
        rankedResource: null
      },
      include: {
        classifiedResource: {
          include: {
            rawRecord: true
          }
        }
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    if (unrankedResources.length === 0) {
      logger.info('No unranked resources found');
      return [];
    }

    logger.info(`Found ${unrankedResources.length} resources to rank`);

    const rankedResources: RankedResource[] = [];

    for (const resource of unrankedResources) {
      try {
        const ranked = await this.rankResource(resource as any, weightingProfile);
        if (ranked) {
          rankedResources.push(ranked);
          await this.saveRankedResource(ranked);
        }
      } catch (error) {
        logger.error(`Ranking failed for resource ${resource.id}`, {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Sort by overall score
    rankedResources.sort((a, b) => b.overallScore - a.overallScore);

    logger.info(`Ranking complete: ${rankedResources.length} resources ranked`);
    return rankedResources;
  }

  async rankResource(
    resource: GeocodedResource, 
    weightingProfile: WeightingProfile = WeightingProfile.COMPREHENSIVE,
    userLocation?: { latitude: number; longitude: number }
  ): Promise<RankedResource | null> {
    try {
      // Calculate individual scoring components
      const scores: RankingScores = {
        availabilityScore: await this.calculateAvailabilityScore(resource),
        accessibilityScore: await this.calculateAccessibilityScore(resource),
        capacityScore: await this.calculateCapacityScore(resource),
        qualityScore: await this.calculateQualityScore(resource),
        urgencyScore: this.calculateUrgencyScore(resource),
        populationScore: this.calculatePopulationScore(resource),
        proximityScore: this.calculateProximityScore(resource, userLocation),
        reliabilityScore: await this.calculateReliabilityScore(resource)
      };

      // Apply weighting profile to calculate overall score
      const overallScore = this.calculateOverallScore(scores, weightingProfile);
      
      // Determine priority level
      const priorityLevel = this.determinePriorityLevel(resource, overallScore);

      // Generate ranking metadata
      const rankingMetadata: RankingMetadata = {
        calculatedAt: new Date(),
        algorithmVersion: this.algorithmVersion,
        weightingProfile,
        contextFactors: this.identifyContextFactors(resource),
        dataFreshness: this.calculateDataFreshness(resource),
        confidenceLevel: this.calculateConfidenceLevel(scores, resource),
        qualityFlags: this.generateQualityFlags(scores, resource)
      };

      const rankedResource: RankedResource = {
        ...resource,
        overallScore,
        rankingScores: scores,
        rankingMetadata,
        priorityLevel
      };

      return rankedResource;

    } catch (error) {
      logger.error(`Ranking calculation failed for resource ${resource.id}`, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  // Individual scoring methods
  private async calculateAvailabilityScore(resource: GeocodedResource): Promise<number> {
    let score = 50; // Base score

    const hours = resource.hours?.toLowerCase() || '';
    
    // 24/7 services get maximum score
    if (hours.includes('24') || hours.includes('24/7') || hours.includes('always open')) {
      score = 100;
    }
    // Extended hours (early morning or late evening)
    else if (hours.includes('6am') || hours.includes('6:00') || 
             hours.includes('10pm') || hours.includes('22:')) {
      score = 85;
    }
    // Standard business hours expansion
    else if (hours.includes('8am') || hours.includes('8:00') ||
             hours.includes('6pm') || hours.includes('18:')) {
      score = 75;
    }
    // Weekend availability
    if (hours.includes('saturday') || hours.includes('sunday') || 
        hours.includes('weekend')) {
      score += 15;
    }

    // Check for service status indicators
    if (hours.includes('closed') || hours.includes('suspended')) {
      score = 10;
    }
    if (hours.includes('appointment') || hours.includes('call ahead')) {
      score -= 10;
    }

    // Emergency services always available
    if (resource.category === ResourceCategory.CRISIS_EMERGENCY) {
      score = Math.max(score, 90);
    }

    return Math.min(100, Math.max(0, score));
  }

  private async calculateAccessibilityScore(resource: GeocodedResource): Promise<number> {
    let score = 60; // Base accessibility assumption
    
    const description = (resource.description || '').toLowerCase();
    const services = resource.services.join(' ').toLowerCase();
    const requirements = (resource.accessRequirements || []).join(' ').toLowerCase();

    // Positive accessibility indicators
    if (description.includes('wheelchair') || description.includes('accessible') || 
        description.includes('ada compliant')) {
      score += 20;
    }
    if (description.includes('public transportation') || description.includes('bus line') ||
        description.includes('metro') || description.includes('transit')) {
      score += 15;
    }
    if (description.includes('parking') || description.includes('free parking')) {
      score += 10;
    }
    if (description.includes('multilingual') || description.includes('spanish') ||
        description.includes('interpreter')) {
      score += 15;
    }
    if (services.includes('transportation') || services.includes('shuttle') ||
        services.includes('bus passes')) {
      score += 20;
    }

    // Negative accessibility factors
    if (requirements.includes('id required') || requirements.includes('documentation')) {
      score -= 10;
    }
    if (requirements.includes('appointment only') || requirements.includes('referral')) {
      score -= 15;
    }
    if (requirements.includes('income verification') || requirements.includes('proof')) {
      score -= 5;
    }

    // Location-based accessibility (urban vs rural approximation)
    if (resource.geolocation.city && resource.geolocation.city.length > 0) {
      // In city limits - better accessibility
      score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  private async calculateCapacityScore(resource: GeocodedResource): Promise<number> {
    let score = 60; // Neutral assumption
    
    const description = (resource.description || '').toLowerCase();
    const category = resource.category;

    // Category-based capacity assumptions
    if (category === ResourceCategory.SHELTER_HOUSING) {
      // Housing has capacity constraints
      score = 40;
      if (description.includes('beds available') || description.includes('vacancy')) {
        score += 30;
      }
      if (description.includes('waiting list') || description.includes('full')) {
        score -= 20;
      }
    } else if (category === ResourceCategory.FOOD_NUTRITION) {
      // Food services generally more accessible
      score = 70;
      if (description.includes('while supplies last') || description.includes('limited')) {
        score -= 15;
      }
    } else if (category === ResourceCategory.HEALTHCARE) {
      // Healthcare often has appointment requirements
      score = 50;
      if (description.includes('walk-in') || description.includes('no appointment')) {
        score += 25;
      }
    }

    // General capacity indicators
    if (description.includes('first come') || description.includes('walk-in welcome')) {
      score += 20;
    }
    if (description.includes('large capacity') || description.includes('serves many')) {
      score += 15;
    }
    if (description.includes('small program') || description.includes('limited slots')) {
      score -= 15;
    }

    return Math.min(100, Math.max(0, score));
  }

  private async calculateQualityScore(resource: GeocodedResource): Promise<number> {
    let score = 60; // Neutral quality assumption
    
    const description = (resource.description || '').toLowerCase();
    const name = resource.name.toLowerCase();

    // Quality indicators
    if (description.includes('accredited') || description.includes('licensed') ||
        description.includes('certified')) {
      score += 20;
    }
    if (description.includes('award') || description.includes('recognized') ||
        description.includes('excellence')) {
      score += 15;
    }
    if (description.includes('experienced') || description.includes('professional') ||
        description.includes('trained staff')) {
      score += 10;
    }
    if (description.includes('comprehensive') || description.includes('full service')) {
      score += 15;
    }

    // Organization reputation indicators
    if (name.includes('salvation army') || name.includes('red cross') ||
        name.includes('united way') || name.includes('catholic charities')) {
      score += 15; // Established organizations
    }
    if (name.includes('community') || name.includes('coalition') ||
        name.includes('alliance')) {
      score += 10; // Community-based organizations
    }

    // Government services (reliable but may be bureaucratic)
    if (name.includes('county') || name.includes('city') || 
        name.includes('state') || name.includes('department')) {
      score += 5;
    }

    // Specialization bonus
    if (resource.targetGroups.length > 0 && resource.targetGroups.length <= 3) {
      score += 10; // Focused services often higher quality
    }

    return Math.min(100, Math.max(0, score));
  }

  private calculateUrgencyScore(resource: GeocodedResource): number {
    const category = resource.category;
    const services = resource.services.join(' ').toLowerCase();
    const description = (resource.description || '').toLowerCase();
    
    let score = CATEGORY_PRIORITY_WEIGHTS[category] || 50;
    
    // Crisis/emergency indicators
    if (services.includes('crisis') || services.includes('emergency') ||
        services.includes('hotline') || services.includes('24/7')) {
      score += 30;
    }
    if (services.includes('immediate') || services.includes('urgent') ||
        services.includes('same day')) {
      score += 20;
    }
    if (description.includes('life threatening') || description.includes('safety') ||
        description.includes('dangerous situation')) {
      score += 25;
    }

    // Safety and protection services
    if (category === ResourceCategory.DOMESTIC_VIOLENCE ||
        category === ResourceCategory.HUMAN_TRAFFICKING) {
      score += 20;
    }

    return Math.min(100, Math.max(0, score));
  }

  private calculatePopulationScore(resource: GeocodedResource): number {
    let score = 70; // Good baseline for general services
    
    const targetGroups = resource.targetGroups;
    
    // Vulnerable population services get higher scores
    if (targetGroups.includes(TargetGroup.CHRONICALLY_HOMELESS) ||
        targetGroups.includes(TargetGroup.RECENTLY_HOMELESS)) {
      score += 20;
    }
    if (targetGroups.includes(TargetGroup.DISABLED) ||
        targetGroups.includes(TargetGroup.SENIORS) ||
        targetGroups.includes(TargetGroup.CHILDREN)) {
      score += 15;
    }
    if (targetGroups.includes(TargetGroup.VETERANS) ||
        targetGroups.includes(TargetGroup.DOMESTIC_VIOLENCE_SURVIVORS) ||
        targetGroups.includes(TargetGroup.TRAFFICKING_SURVIVORS)) {
      score += 15;
    }
    if (targetGroups.includes(TargetGroup.LGBTQ) ||
        targetGroups.includes(TargetGroup.IMMIGRANTS) ||
        targetGroups.includes(TargetGroup.REFUGEES)) {
      score += 10;
    }

    // Broad services vs specialized
    if (targetGroups.includes(TargetGroup.GENERAL_PUBLIC)) {
      score += 10; // Accessible to all
    }
    if (targetGroups.length === 1 && !targetGroups.includes(TargetGroup.GENERAL_PUBLIC)) {
      score += 15; // Highly specialized service
    }

    return Math.min(100, Math.max(0, score));
  }

  private calculateProximityScore(
    resource: GeocodedResource, 
    userLocation?: { latitude: number; longitude: number }
  ): number {
    if (!userLocation) {
      return 60; // Neutral score when no location provided
    }

    // Calculate distance in meters
    const distance = this.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      resource.geolocation.latitude,
      resource.geolocation.longitude
    );

    // Score based on distance relative to service radius
    const serviceRadius = resource.serviceRadius;
    
    if (distance <= serviceRadius * 0.25) {
      return 100; // Very close
    } else if (distance <= serviceRadius * 0.5) {
      return 85;  // Close
    } else if (distance <= serviceRadius) {
      return 70;  // Within service area
    } else if (distance <= serviceRadius * 1.5) {
      return 50;  // Slightly outside service area
    } else if (distance <= serviceRadius * 2) {
      return 30;  // Far but potentially accessible
    } else {
      return 10;  // Very far
    }
  }

  private async calculateReliabilityScore(resource: GeocodedResource): Promise<number> {
    let score = 65; // Good baseline assumption
    
    const name = resource.name.toLowerCase();
    const description = (resource.description || '').toLowerCase();
    
    // Funding stability indicators
    if (name.includes('county') || name.includes('city') || name.includes('state')) {
      score += 20; // Government funding more stable
    }
    if (name.includes('federal') || name.includes('hud') || name.includes('va')) {
      score += 25; // Federal programs very stable
    }
    if (name.includes('nonprofit') || name.includes('501c')) {
      score += 10; // Nonprofit structure
    }

    // Established organizations
    if (name.includes('salvation army') || name.includes('goodwill') ||
        name.includes('catholic charities') || name.includes('red cross')) {
      score += 20; // Long-established organizations
    }

    // Service consistency indicators
    if (description.includes('ongoing') || description.includes('continuous') ||
        description.includes('permanent')) {
      score += 15;
    }
    if (description.includes('temporary') || description.includes('pilot') ||
        description.includes('grant funded')) {
      score -= 15;
    }

    // Data freshness penalty
    const daysSinceUpdate = this.calculateDataFreshness(resource);
    if (daysSinceUpdate > 90) {
      score -= 20; // Very old data
    } else if (daysSinceUpdate > 30) {
      score -= 10; // Somewhat old data
    }

    return Math.min(100, Math.max(0, score));
  }

  // Weighting and scoring aggregation
  private calculateOverallScore(scores: RankingScores, profile: WeightingProfile): number {
    const weights = WEIGHTING_PROFILES[profile];
    let totalScore = 0;
    let totalWeight = 0;

    // Apply weights or use equal weighting
    Object.entries(scores).forEach(([scoreName, scoreValue]) => {
      const weight = (weights as any)[scoreName] || 12.5; // Equal weight default
      totalScore += scoreValue * (weight / 100);
      totalWeight += weight / 100;
    });

    return Math.round(totalScore / totalWeight);
  }

  private determinePriorityLevel(resource: GeocodedResource, overallScore: number): PriorityLevel {
    const category = resource.category;
    
    // Crisis categories are always high priority
    if (category === ResourceCategory.CRISIS_EMERGENCY ||
        category === ResourceCategory.DOMESTIC_VIOLENCE ||
        category === ResourceCategory.HUMAN_TRAFFICKING) {
      return overallScore >= 60 ? PriorityLevel.CRITICAL : PriorityLevel.HIGH;
    }
    
    // Basic needs categories
    if (category === ResourceCategory.SHELTER_HOUSING ||
        category === ResourceCategory.FOOD_NUTRITION ||
        category === ResourceCategory.HEALTHCARE) {
      if (overallScore >= 80) return PriorityLevel.HIGH;
      if (overallScore >= 60) return PriorityLevel.MEDIUM;
      if (overallScore >= 40) return PriorityLevel.LOW;
      return PriorityLevel.INACTIVE;
    }
    
    // General scoring
    if (overallScore >= 85) return PriorityLevel.CRITICAL;
    if (overallScore >= 70) return PriorityLevel.HIGH;
    if (overallScore >= 50) return PriorityLevel.MEDIUM;
    if (overallScore >= 30) return PriorityLevel.LOW;
    return PriorityLevel.INACTIVE;
  }

  // Utility methods
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in meters
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private identifyContextFactors(resource: GeocodedResource): string[] {
    const factors: string[] = [];
    
    if (resource.geoQuality === 'poor') factors.push('poor_geocoding');
    if (resource.confidenceScore < 70) factors.push('low_classification_confidence');
    if (!resource.phone && !resource.website) factors.push('limited_contact_info');
    if (resource.accessRequirements && resource.accessRequirements.length > 0) {
      factors.push('access_requirements');
    }
    if (this.calculateDataFreshness(resource) > 60) factors.push('stale_data');
    
    return factors;
  }

  private calculateDataFreshness(resource: GeocodedResource): number {
    const now = new Date();
    const updated = new Date(resource.updatedAt);
    return Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
  }

  private calculateConfidenceLevel(scores: RankingScores, resource: GeocodedResource): number {
    let confidence = 70; // Base confidence
    
    // Reduce confidence for missing data
    if (!resource.phone && !resource.website) confidence -= 10;
    if (!resource.hours) confidence -= 10;
    if (resource.description.length < 50) confidence -= 15;
    
    // Reduce confidence for poor geocoding
    if (resource.geoQuality === 'poor') confidence -= 20;
    if (resource.geoQuality === 'failed') confidence -= 40;
    
    // Reduce confidence for old data
    const daysSinceUpdate = this.calculateDataFreshness(resource);
    if (daysSinceUpdate > 180) confidence -= 30;
    else if (daysSinceUpdate > 90) confidence -= 15;
    
    // Increase confidence for high classification scores
    if (resource.confidenceScore > 85) confidence += 10;
    
    return Math.min(100, Math.max(0, confidence));
  }

  private generateQualityFlags(scores: RankingScores, resource: GeocodedResource): string[] {
    const flags: string[] = [];
    
    if (scores.availabilityScore < 30) flags.push('limited_hours');
    if (scores.accessibilityScore < 40) flags.push('accessibility_concerns');
    if (scores.capacityScore < 35) flags.push('capacity_constraints');
    if (scores.reliabilityScore < 40) flags.push('reliability_concerns');
    if (!resource.phone && !resource.website) flags.push('contact_verification_needed');
    if (this.calculateDataFreshness(resource) > 90) flags.push('data_verification_needed');
    
    return flags;
  }

  private async saveRankedResource(resource: RankedResource): Promise<void> {
    try {
      await prisma.rankedResource.upsert({
        where: { 
          geocodedResourceId: resource.id 
        },
        update: {
          overallScore: resource.overallScore,
          availabilityScore: resource.rankingScores.availabilityScore,
          accessibilityScore: resource.rankingScores.accessibilityScore,
          capacityScore: resource.rankingScores.capacityScore,
          qualityScore: resource.rankingScores.qualityScore,
          urgencyScore: resource.rankingScores.urgencyScore,
          populationScore: resource.rankingScores.populationScore,
          proximityScore: resource.rankingScores.proximityScore,
          reliabilityScore: resource.rankingScores.reliabilityScore,
          priorityLevel: resource.priorityLevel,
          rankingMetadata: resource.rankingMetadata,
          updatedAt: new Date()
        },
        create: {
          id: `ranked-${resource.id}`,
          geocodedResourceId: resource.id,
          overallScore: resource.overallScore,
          availabilityScore: resource.rankingScores.availabilityScore,
          accessibilityScore: resource.rankingScores.accessibilityScore,
          capacityScore: resource.rankingScores.capacityScore,
          qualityScore: resource.rankingScores.qualityScore,
          urgencyScore: resource.rankingScores.urgencyScore,
          populationScore: resource.rankingScores.populationScore,
          proximityScore: resource.rankingScores.proximityScore,
          reliabilityScore: resource.rankingScores.reliabilityScore,
          priorityLevel: resource.priorityLevel,
          rankingMetadata: resource.rankingMetadata,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      logger.debug(`Saved ranked resource: ${resource.name} (score: ${resource.overallScore})`);
    } catch (error) {
      logger.error(`Failed to save ranked resource ${resource.id}`, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Batch and management methods
  async batchRanking(
    batchSize: number = 100, 
    weightingProfile: WeightingProfile = WeightingProfile.COMPREHENSIVE
  ): Promise<void> {
    logger.info('Starting batch ranking process');
    
    let totalProcessed = 0;
    let hasMoreResources = true;

    while (hasMoreResources) {
      const ranked = await this.rankUnrankedResources(batchSize, weightingProfile);
      
      if (ranked.length === 0) {
        hasMoreResources = false;
      } else {
        totalProcessed += ranked.length;
        logger.info(`Batch complete: ${ranked.length} resources ranked (total: ${totalProcessed})`);
      }
    }

    logger.info(`Batch ranking complete: ${totalProcessed} total resources processed`);
  }

  async reRankResources(
    scoreThreshold: number = 40, 
    weightingProfile: WeightingProfile = WeightingProfile.COMPREHENSIVE
  ): Promise<void> {
    logger.info(`Re-ranking resources with overall score < ${scoreThreshold}`);

    const lowScoredResources = await prisma.rankedResource.findMany({
      where: {
        overallScore: { lt: scoreThreshold }
      },
      include: {
        geocodedResource: {
          include: {
            classifiedResource: {
              include: {
                rawRecord: true
              }
            }
          }
        }
      },
      take: 200
    });

    logger.info(`Found ${lowScoredResources.length} low-scored resources to re-rank`);

    for (const rankedResource of lowScoredResources) {
      try {
        const reRanked = await this.rankResource(
          rankedResource.geocodedResource as any, 
          weightingProfile
        );
        
        if (reRanked && reRanked.overallScore > rankedResource.overallScore) {
          await this.saveRankedResource(reRanked);
          logger.info(`Improved ranking for ${reRanked.name}: ${rankedResource.overallScore} -> ${reRanked.overallScore}`);
        }
      } catch (error) {
        logger.error(`Re-ranking failed for ${rankedResource.id}`, {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  // Statistics and analytics
  async getRankingStats(): Promise<any> {
    const totalRanked = await prisma.rankedResource.count();
    
    const priorityStats = await prisma.rankedResource.groupBy({
      by: ['priorityLevel'],
      _count: { id: true },
      _avg: { overallScore: true }
    });

    const scoreDistribution = await prisma.rankedResource.aggregate({
      _avg: { overallScore: true },
      _min: { overallScore: true },
      _max: { overallScore: true }
    });

    const recentlyRanked = await prisma.rankedResource.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    const topResources = await prisma.rankedResource.findMany({
      take: 10,
      orderBy: { overallScore: 'desc' },
      include: {
        geocodedResource: {
          include: {
            classifiedResource: true
          }
        }
      }
    });

    return {
      totalRanked,
      recentlyRanked,
      scoreDistribution,
      priorityDistribution: priorityStats,
      topResources: topResources.map(r => ({
        name: r.geocodedResource.classifiedResource.name,
        category: r.geocodedResource.classifiedResource.category,
        score: r.overallScore,
        priority: r.priorityLevel
      }))
    };
  }
}

// Export singleton instance
export const resourceRanking = new ResourceRanking();