import logger from '../config/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ShelterSearchCriteria {
  userId?: string;
  lat?: number;
  lng?: number;
  maxDistance?: number; // miles
  populationType?: 'men' | 'women' | 'families' | 'youth' | 'mixed';
  hasAvailableBeds?: boolean;
  acceptsPets?: boolean;
  hasSpecialServices?: string[]; // medical, mental_health, substance_abuse, etc.
  wheelchairAccessible?: boolean;
  emergencyOnly?: boolean;
  requiresIntake?: boolean;
  maxStayDuration?: number; // days
}

export interface ShelterRanking {
  shelter: any;
  score: number;
  distance?: number;
  availabilityMatch: boolean;
  serviceMatches: string[];
  accessibilityMatch: boolean;
  reasoning: string[];
  warnings: string[];
}

export class ShelterRankingEngine {

  async rankShelters(criteria: ShelterSearchCriteria): Promise<ShelterRanking[]> {
    logger.info('Ranking shelters for user criteria', { 
      location: criteria.lat && criteria.lng ? 'provided' : 'not provided',
      populationType: criteria.populationType,
      hasAvailableBeds: criteria.hasAvailableBeds
    });

    // Get base shelter data with availability
    const shelters = await this.getSheltersWithAvailability(criteria);
    
    if (shelters.length === 0) {
      logger.warn('No shelters found matching base criteria');
      return [];
    }

    // Calculate rankings for each shelter
    const rankings: ShelterRanking[] = [];
    
    for (const shelter of shelters) {
      const ranking = await this.calculateShelterRanking(shelter, criteria);
      rankings.push(ranking);
    }

    // Sort by score (highest first)
    rankings.sort((a, b) => b.score - a.score);

    logger.info(`Ranked ${rankings.length} shelters`, {
      topScore: rankings[0]?.score,
      averageScore: rankings.length > 0 ? 
        (rankings.reduce((sum, r) => sum + r.score, 0) / rankings.length).toFixed(1) : 0
    });

    return rankings;
  }

  private async getSheltersWithAvailability(criteria: ShelterSearchCriteria) {
    const where: any = {
      isActive: true
    };

    // Filter by population type
    if (criteria.populationType) {
      switch (criteria.populationType) {
        case 'men':
          where.servesAdultMen = true;
          break;
        case 'women':
          where.servesAdultWomen = true;
          break;
        case 'families':
          where.servesFamilies = true;
          break;
        case 'youth':
          where.servesYouth = true;
          break;
        // 'mixed' doesn't add specific filter
      }
    }

    // Filter by availability if requested
    if (criteria.hasAvailableBeds) {
      where.OR = [
        { currentAvailableTotal: { gt: 0 } },
        { currentAvailableMen: { gt: 0 } },
        { currentAvailableWomen: { gt: 0 } },
        { currentAvailableFamilies: { gt: 0 } },
        { currentAvailableYouth: { gt: 0 } }
      ];
    }

    // Filter by special requirements
    if (criteria.acceptsPets !== undefined) {
      where.allowsPets = criteria.acceptsPets;
    }
    
    if (criteria.wheelchairAccessible) {
      where.wheelchairAccessible = true;
    }

    if (criteria.emergencyOnly !== undefined) {
      where.emergencyOnly = criteria.emergencyOnly;
    }

    if (criteria.requiresIntake !== undefined) {
      where.requiresIntake = criteria.requiresIntake;
    }

    return await prisma.shelterFacility.findMany({
      where,
      include: {
        availabilityLogs: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });
  }

  private async calculateShelterRanking(
    shelter: any, 
    criteria: ShelterSearchCriteria
  ): Promise<ShelterRanking> {
    
    let score = 0;
    const reasoning: string[] = [];
    const warnings: string[] = [];
    const serviceMatches: string[] = [];
    let availabilityMatch = false;
    let accessibilityMatch = false;

    // Base score for operational shelters
    score += 10;
    reasoning.push('Base operational score');

    // Availability scoring (40% of total weight)
    const availabilityScore = this.calculateAvailabilityScore(shelter, criteria);
    score += availabilityScore.score;
    if (availabilityScore.hasAvailable) {
      availabilityMatch = true;
      reasoning.push(availabilityScore.reason);
    } else if (availabilityScore.score === 0) {
      warnings.push('No available beds reported');
    }

    // Population type match (25% of total weight)
    const populationScore = this.calculatePopulationScore(shelter, criteria);
    score += populationScore.score;
    reasoning.push(populationScore.reason);

    // Distance scoring (15% of total weight)
    let distance: number | undefined;
    if (criteria.lat && criteria.lng) {
      distance = this.calculateDistance(
        criteria.lat, criteria.lng, 
        shelter.latitude, shelter.longitude
      );
      
      if (distance !== null && distance <= (criteria.maxDistance || 50)) {
        const distanceScore = this.calculateDistanceScore(distance, criteria.maxDistance);
        score += distanceScore;
        reasoning.push(`Within ${distance.toFixed(1)} miles`);
      } else if (distance !== null) {
        warnings.push(`Outside preferred range: ${distance.toFixed(1)} miles`);
      }
    }

    // Special services matching (10% of total weight)
    if (criteria.hasSpecialServices && criteria.hasSpecialServices.length > 0) {
      const servicesScore = this.calculateServicesScore(shelter, criteria.hasSpecialServices);
      score += servicesScore.score;
      serviceMatches.push(...servicesScore.matches);
      if (servicesScore.matches.length > 0) {
        reasoning.push(`Offers ${servicesScore.matches.length} requested services`);
      }
    }

    // Accessibility and accommodation scoring (10% of total weight)
    const accommodationScore = this.calculateAccommodationScore(shelter, criteria);
    score += accommodationScore.score;
    accessibilityMatch = accommodationScore.accessible;
    reasoning.push(...accommodationScore.reasons);
    warnings.push(...accommodationScore.warnings);

    // Quality and reputation adjustments
    const qualityScore = this.calculateQualityScore(shelter);
    score += qualityScore.score;
    if (qualityScore.reason) {
      reasoning.push(qualityScore.reason);
    }

    // Capacity and occupancy rate adjustments
    const capacityScore = this.calculateCapacityScore(shelter);
    score += capacityScore.score;
    if (capacityScore.reason) {
      reasoning.push(capacityScore.reason);
    }

    // Recent data freshness bonus
    if (shelter.lastAutoUpdateAt) {
      const hoursAgo = (Date.now() - shelter.lastAutoUpdateAt.getTime()) / (1000 * 60 * 60);
      if (hoursAgo <= 6) {
        score += 3;
        reasoning.push('Recent availability data');
      } else if (hoursAgo <= 24) {
        score += 1;
        reasoning.push('Data updated within 24 hours');
      } else {
        warnings.push(`Availability data is ${Math.floor(hoursAgo)} hours old`);
      }
    } else {
      warnings.push('No recent availability updates');
    }

    return {
      shelter,
      score: Math.max(0, Math.round(score * 10) / 10), // Round to 1 decimal
      distance,
      availabilityMatch,
      serviceMatches,
      accessibilityMatch,
      reasoning,
      warnings
    };
  }

  private calculateAvailabilityScore(shelter: any, criteria: ShelterSearchCriteria) {
    let score = 0;
    let hasAvailable = false;
    let reason = '';

    if (!criteria.hasAvailableBeds) {
      return { score: 20, hasAvailable: true, reason: 'Availability not required' };
    }

    const populationType = criteria.populationType;
    let relevantAvailability = 0;

    // Check availability for specific population types
    switch (populationType) {
      case 'men':
        relevantAvailability = shelter.currentAvailableMen || 0;
        if (relevantAvailability > 0) {
          score = 40;
          hasAvailable = true;
          reason = `${relevantAvailability} beds available for men`;
        }
        break;
      
      case 'women':
        relevantAvailability = shelter.currentAvailableWomen || 0;
        if (relevantAvailability > 0) {
          score = 40;
          hasAvailable = true;
          reason = `${relevantAvailability} beds available for women`;
        }
        break;
      
      case 'families':
        relevantAvailability = shelter.currentAvailableFamilies || 0;
        if (relevantAvailability > 0) {
          score = 40;
          hasAvailable = true;
          reason = `${relevantAvailability} family units available`;
        }
        break;
      
      case 'youth':
        relevantAvailability = shelter.currentAvailableYouth || 0;
        if (relevantAvailability > 0) {
          score = 40;
          hasAvailable = true;
          reason = `${relevantAvailability} youth beds available`;
        }
        break;
      
      default:
        // Check total or any category
        const totalAvailable = shelter.currentAvailableTotal || 0;
        const menAvailable = shelter.currentAvailableMen || 0;
        const womenAvailable = shelter.currentAvailableWomen || 0;
        const familyAvailable = shelter.currentAvailableFamilies || 0;
        const youthAvailable = shelter.currentAvailableYouth || 0;
        
        relevantAvailability = Math.max(
          totalAvailable, 
          menAvailable, 
          womenAvailable, 
          familyAvailable, 
          youthAvailable
        );
        
        if (relevantAvailability > 0) {
          score = 40;
          hasAvailable = true;
          reason = `${relevantAvailability} beds available`;
        }
        break;
    }

    // Bonus for higher availability
    if (relevantAvailability >= 10) {
      score += 5;
      reason += ' (high availability)';
    } else if (relevantAvailability >= 5) {
      score += 2;
      reason += ' (moderate availability)';
    }

    return { score, hasAvailable, reason };
  }

  private calculatePopulationScore(shelter: any, criteria: ShelterSearchCriteria) {
    const populationType = criteria.populationType;
    
    if (!populationType || populationType === 'mixed') {
      return { score: 25, reason: 'Serves general population' };
    }

    let score = 0;
    let reason = '';

    switch (populationType) {
      case 'men':
        if (shelter.servesAdultMen) {
          score = 25;
          reason = 'Serves adult men';
          // Bonus if it's men-only (more focused services)
          if (!shelter.servesAdultWomen && !shelter.servesFamilies) {
            score += 5;
            reason += ' (men-focused facility)';
          }
        } else {
          reason = 'Does not serve adult men';
        }
        break;
      
      case 'women':
        if (shelter.servesAdultWomen) {
          score = 25;
          reason = 'Serves adult women';
          // Bonus for women-only facilities (safer environment)
          if (!shelter.servesAdultMen || shelter.hasWomenOnlyAreas) {
            score += 5;
            reason += ' (women-focused/safe space)';
          }
        } else {
          reason = 'Does not serve adult women';
        }
        break;
      
      case 'families':
        if (shelter.servesFamilies) {
          score = 25;
          reason = 'Serves families with children';
          // Bonus for family-specific facilities
          if (shelter.hasFamilyRooms || shelter.hasChildcare) {
            score += 5;
            reason += ' (family amenities)';
          }
        } else {
          reason = 'Does not serve families';
        }
        break;
      
      case 'youth':
        if (shelter.servesYouth) {
          score = 25;
          reason = 'Serves youth/young adults';
          // Bonus for youth-specific programming
          if (shelter.hasEducationalSupport || shelter.hasJobTraining) {
            score += 5;
            reason += ' (youth programming)';
          }
        } else {
          reason = 'Does not serve youth';
        }
        break;
    }

    return { score, reason };
  }

  private calculateDistanceScore(distance: number, maxDistance?: number): number {
    const preferredDistance = maxDistance || 10; // Default 10 mile preference
    
    if (distance <= 2) {
      return 15; // Very close
    } else if (distance <= 5) {
      return 12; // Close
    } else if (distance <= preferredDistance) {
      return 8; // Within preferred range
    } else if (distance <= preferredDistance * 2) {
      return 3; // Acceptable but far
    } else {
      return 0; // Too far
    }
  }

  private calculateServicesScore(shelter: any, requestedServices: string[]) {
    const score = 0;
    const matches: string[] = [];

    const availableServices: any = {
      'medical': shelter.hasMedicalCare,
      'mental_health': shelter.hasMentalHealthSupport,
      'substance_abuse': shelter.hasSubstanceAbuseSupport,
      'job_training': shelter.hasJobTraining,
      'childcare': shelter.hasChildcare,
      'educational_support': shelter.hasEducationalSupport,
      'case_management': shelter.hasCaseManagement,
      'legal_aid': shelter.hasLegalAid,
      'transportation': shelter.hasTransportation
    };

    for (const service of requestedServices) {
      if (availableServices[service]) {
        matches.push(service);
      }
    }

    const matchScore = (matches.length / requestedServices.length) * 10;
    
    return { score: matchScore, matches };
  }

  private calculateAccommodationScore(shelter: any, criteria: ShelterSearchCriteria) {
    let score = 0;
    const reasons: string[] = [];
    const warnings: string[] = [];
    let accessible = true;

    // Wheelchair accessibility
    if (criteria.wheelchairAccessible) {
      if (shelter.wheelchairAccessible) {
        score += 5;
        reasons.push('Wheelchair accessible');
      } else {
        accessible = false;
        warnings.push('Not wheelchair accessible');
      }
    } else if (shelter.wheelchairAccessible) {
      score += 2;
      reasons.push('Wheelchair accessible facility');
    }

    // Pet accommodation
    if (criteria.acceptsPets) {
      if (shelter.allowsPets) {
        score += 5;
        reasons.push('Accepts pets');
      } else {
        warnings.push('Does not accept pets');
      }
    } else if (shelter.allowsPets) {
      score += 1;
      reasons.push('Pet-friendly');
    }

    // Emergency vs. planned stays
    if (criteria.emergencyOnly === true && shelter.emergencyOnly) {
      score += 3;
      reasons.push('Emergency shelter');
    } else if (criteria.emergencyOnly === false && !shelter.emergencyOnly) {
      score += 3;
      reasons.push('Accepts planned stays');
    }

    // Intake requirements
    if (criteria.requiresIntake === false && !shelter.requiresIntake) {
      score += 2;
      reasons.push('No intake required');
    } else if (shelter.requiresIntake) {
      warnings.push('Requires intake process');
    }

    return { score, accessible, reasons, warnings };
  }

  private calculateQualityScore(shelter: any) {
    let score = 0;
    let reason = '';

    // Basic amenities bonus
    const amenityCount = [
      shelter.hasShowers,
      shelter.hasLaundry,
      shelter.hasMeals,
      shelter.hasStorage,
      shelter.hasPhoneAccess,
      shelter.hasInternetAccess
    ].filter(Boolean).length;

    if (amenityCount >= 5) {
      score += 5;
      reason = 'Excellent amenities';
    } else if (amenityCount >= 3) {
      score += 3;
      reason = 'Good amenities';
    } else if (amenityCount >= 1) {
      score += 1;
      reason = 'Basic amenities';
    }

    // Safety and security
    if (shelter.hasSecurityStaff) {
      score += 2;
    }

    return { score, reason };
  }

  private calculateCapacityScore(shelter: any) {
    let score = 0;
    let reason = '';

    if (shelter.capacityTotal && shelter.currentAvailableTotal !== null) {
      const occupancyRate = (shelter.capacityTotal - shelter.currentAvailableTotal) / shelter.capacityTotal;
      
      if (occupancyRate < 0.5) {
        score += 2;
        reason = 'Low occupancy (more space)';
      } else if (occupancyRate < 0.8) {
        score += 1;
        reason = 'Moderate occupancy';
      } else if (occupancyRate >= 0.95) {
        score -= 2;
        reason = 'Very high occupancy';
      }
    }

    // Large facilities might have more resources
    if (shelter.capacityTotal && shelter.capacityTotal >= 100) {
      score += 1;
    }

    return { score, reason };
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number | null {
    if (!lat2 || !lng2) return null;

    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Helper method to get top recommendations with explanations
  async getTopRecommendations(
    criteria: ShelterSearchCriteria, 
    limit: number = 5
  ): Promise<{
    recommendations: ShelterRanking[];
    summary: {
      totalFound: number;
      withAvailability: number;
      averageDistance?: number;
      topServices: string[];
    };
  }> {
    
    const allRankings = await this.rankShelters(criteria);
    const recommendations = allRankings.slice(0, limit);
    
    const withAvailability = allRankings.filter(r => r.availabilityMatch).length;
    const distances = allRankings
      .filter(r => r.distance !== undefined)
      .map(r => r.distance!);
    
    const averageDistance = distances.length > 0 ? 
      distances.reduce((sum, d) => sum + d, 0) / distances.length : undefined;

    // Count service matches across all shelters
    const serviceCount: { [key: string]: number } = {};
    allRankings.forEach(ranking => {
      ranking.serviceMatches.forEach(service => {
        serviceCount[service] = (serviceCount[service] || 0) + 1;
      });
    });

    const topServices = Object.entries(serviceCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([service]) => service);

    return {
      recommendations,
      summary: {
        totalFound: allRankings.length,
        withAvailability,
        averageDistance: averageDistance ? Math.round(averageDistance * 10) / 10 : undefined,
        topServices
      }
    };
  }
}

// Export singleton instance
export const shelterRankingEngine = new ShelterRankingEngine();