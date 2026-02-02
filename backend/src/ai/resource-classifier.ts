import { getValidEnvKey } from '../utils/keys';
import logger from '../config/logger';
import { PrismaClient } from '@prisma/client';
import type { RawResourceRecord } from '../ingestion/resource-ingestion';

const prisma = new PrismaClient();

// V1: Keyword-based resource classification (no OpenAI dependency)

export interface ClassifiedResource {
  id: string;
  rawRecordId: string;
  name: string;
  category: ResourceCategory;
  subcategory?: string;
  description: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: string;
  targetGroups: TargetGroup[];
  accessRequirements?: string[];
  services: string[];
  eligibilityCriteria?: string;
  confidenceScore: number;
  classificationMetadata: ClassificationMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export enum ResourceCategory {
  // Primary Categories
  FOOD_NUTRITION = 'food_nutrition',
  SHELTER_HOUSING = 'shelter_housing', 
  HEALTHCARE = 'healthcare',
  MENTAL_HEALTH = 'mental_health',
  ADDICTION_RECOVERY = 'addiction_recovery',
  LEGAL_AID = 'legal_aid',
  EMPLOYMENT = 'employment',
  EDUCATION_TRAINING = 'education_training',
  TRANSPORTATION = 'transportation',
  DISABILITY_SERVICES = 'disability_services',
  CRISIS_EMERGENCY = 'crisis_emergency',
  FINANCIAL_ASSISTANCE = 'financial_assistance',
  CLOTHING_PERSONAL = 'clothing_personal',
  COMMUNICATION_TECH = 'communication_tech',
  DOCUMENTATION_ID = 'documentation_id',
  
  // Population-Specific
  VETERANS_SERVICES = 'veterans_services',
  WOMEN_SERVICES = 'women_services', 
  CHILDREN_YOUTH = 'children_youth',
  SENIORS_ELDERLY = 'seniors_elderly',
  LGBTQ_SERVICES = 'lgbtq_services',
  
  // Specialized
  DOMESTIC_VIOLENCE = 'domestic_violence',
  HUMAN_TRAFFICKING = 'human_trafficking',
  IMMIGRANT_REFUGEE = 'immigrant_refugee',
  
  // Support & Coordination
  CASE_MANAGEMENT = 'case_management',
  ADVOCACY = 'advocacy',
  INFORMATION_REFERRAL = 'information_referral',
  
  // Uncategorized
  OTHER = 'other'
}

export enum TargetGroup {
  GENERAL_PUBLIC = 'general_public',
  ADULTS = 'adults',
  FAMILIES = 'families',
  CHILDREN = 'children',
  YOUTH = 'youth',
  SENIORS = 'seniors',
  VETERANS = 'veterans',
  WOMEN = 'women',
  MEN = 'men',
  DISABLED = 'disabled',
  LGBTQ = 'lgbtq',
  IMMIGRANTS = 'immigrants',
  REFUGEES = 'refugees',
  SINGLE_MOTHERS = 'single_mothers',
  PREGNANT_WOMEN = 'pregnant_women',
  CHRONICALLY_HOMELESS = 'chronically_homeless',
  RECENTLY_HOMELESS = 'recently_homeless',
  AT_RISK = 'at_risk',
  SUBSTANCE_USERS = 'substance_users',
  MENTAL_HEALTH_CLIENTS = 'mental_health_clients',
  DOMESTIC_VIOLENCE_SURVIVORS = 'domestic_violence_survivors',
  TRAFFICKING_SURVIVORS = 'trafficking_survivors',
  EX_OFFENDERS = 'ex_offenders'
}

export interface ClassificationMetadata {
  aiModel: string;
  promptVersion: string;
  processingTime: number;
  rawTextAnalyzed: string;
  keywordsFound: string[];
  alternativeCategories: { category: ResourceCategory; confidence: number }[];
  qualityFlags: string[];
}

// Classification prompt template
const CLASSIFICATION_PROMPT = `
You are an expert classifier for homeless assistance resources. Analyze the provided resource information and return a structured JSON classification.

RESOURCE CATEGORIES:
- food_nutrition: Food banks, soup kitchens, meal programs, nutrition assistance
- shelter_housing: Emergency shelters, transitional housing, permanent housing, voucher programs
- healthcare: Medical clinics, hospitals, dental care, vision care, pharmacy assistance
- mental_health: Counseling, therapy, psychiatric services, support groups
- addiction_recovery: Detox, rehab, AA/NA meetings, medication-assisted treatment
- legal_aid: Legal assistance, court advocacy, immigration help, benefits advocacy
- employment: Job training, placement services, resume help, interview preparation
- education_training: GED programs, vocational training, life skills, computer training
- transportation: Bus passes, ride programs, vehicle assistance, gas vouchers
- disability_services: Disability benefits, accessibility services, adaptive equipment
- crisis_emergency: Crisis intervention, hotlines, emergency assistance, safety services
- financial_assistance: Emergency funds, utility assistance, debt counseling, benefits
- clothing_personal: Clothing banks, hygiene supplies, laundry services
- communication_tech: Phone services, internet access, device assistance
- documentation_id: ID replacement, birth certificates, Social Security cards
- veterans_services: Veteran-specific programs and benefits
- women_services: Women-only services and programs
- children_youth: Services specifically for minors and young adults
- seniors_elderly: Age-specific services for older adults
- lgbtq_services: LGBTQ+-affirming services
- domestic_violence: DV shelters, safety planning, legal protection
- human_trafficking: Trafficking survivor services
- immigrant_refugee: Immigration services, ESL classes, cultural assistance
- case_management: Coordination of services, advocacy, navigation
- advocacy: Rights advocacy, policy work, community organizing
- information_referral: 211 services, resource navigation, information hotlines
- other: Services that don't fit other categories

TARGET GROUPS (can be multiple):
- general_public, adults, families, children, youth, seniors, veterans, women, men
- disabled, lgbtq, immigrants, refugees, single_mothers, pregnant_women
- chronically_homeless, recently_homeless, at_risk, substance_users
- mental_health_clients, domestic_violence_survivors, trafficking_survivors, ex_offenders

INSTRUCTIONS:
1. Analyze the resource name, description, and any available metadata
2. Identify the primary category that best fits the service
3. Determine target groups served
4. Extract services offered
5. Identify any access requirements or eligibility criteria
6. Assign confidence score (0-100)

Return ONLY valid JSON in this exact format:
{
  "category": "primary_category",
  "subcategory": "optional_subcategory",
  "targetGroups": ["target1", "target2"],
  "services": ["service1", "service2"],
  "accessRequirements": ["requirement1", "requirement2"],
  "eligibilityCriteria": "brief criteria description",
  "confidenceScore": 85,
  "keywordsFound": ["keyword1", "keyword2"],
  "alternativeCategories": [
    {"category": "alt_category", "confidence": 75}
  ],
  "qualityFlags": ["flag1", "flag2"]
}

RESOURCE TO CLASSIFY:
`;

export class ResourceClassifier {
  private promptVersion: string = '2.0';
  private processingStats = {
    totalProcessed: 0,
    successful: 0,
    failed: 0,
    averageConfidence: 0
  };

  async classifyRawRecords(limit: number = 50): Promise<ClassifiedResource[]> {
    logger.info(`Starting classification of up to ${limit} raw records`);

    // Get unclassified raw records
    const rawRecords = await prisma.rawResourceRecord.findMany({
      where: {
        classifiedResource: null // No existing classification
      },
      take: limit,
      orderBy: { extractedAt: 'desc' }
    });

    if (rawRecords.length === 0) {
      logger.info('No unclassified records found');
      return [];
    }

    logger.info(`Found ${rawRecords.length} unclassified records to process`);

    const classifiedResources: ClassifiedResource[] = [];

    for (const rawRecord of rawRecords) {
      try {
        const classified = await this.classifyRecord(rawRecord);
        if (classified) {
          classifiedResources.push(classified);
          await this.saveClassifiedResource(classified);
          this.processingStats.successful++;
        } else {
          this.processingStats.failed++;
        }
        this.processingStats.totalProcessed++;

        // Rate limiting - pause between API calls
        await this.delay(1000);

      } catch (error) {
        logger.error(`Classification failed for record ${rawRecord.id}`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          rawRecordId: rawRecord.id
        });
        this.processingStats.failed++;
        this.processingStats.totalProcessed++;
      }
    }

    // Update processing statistics
    if (classifiedResources.length > 0) {
      const avgConfidence = classifiedResources.reduce((sum, r) => sum + r.confidenceScore, 0) / classifiedResources.length;
      this.processingStats.averageConfidence = avgConfidence;
    }

    logger.info(`Classification complete: ${this.processingStats.successful} successful, ${this.processingStats.failed} failed`);
    
    return classifiedResources;
  }

  async classifyRecord(rawRecord: RawResourceRecord): Promise<ClassifiedResource | null> {
    const startTime = Date.now();
    
    try {
      // Extract text content from raw record
      const textContent = this.extractTextForAnalysis(rawRecord);
      
      if (!textContent.trim()) {
        logger.warn(`No analyzable text found for record ${rawRecord.id}`);
        return null;
      }

      // Call OpenAI API for classification
      const classification = await this.callClassificationAPI(textContent);
      
      if (!classification) {
        return null;
      }

      const processingTime = Date.now() - startTime;

      // Create classified resource object
      const classifiedResource: ClassifiedResource = {
        id: `classified-${rawRecord.id}`,
        rawRecordId: rawRecord.id,
        name: this.extractResourceName(rawRecord),
        category: classification.category,
        subcategory: classification.subcategory,
        description: this.extractDescription(rawRecord),
        address: this.extractAddress(rawRecord),
        phone: this.extractPhone(rawRecord),
        email: this.extractEmail(rawRecord),
        website: this.extractWebsite(rawRecord),
        hours: this.extractHours(rawRecord),
        targetGroups: classification.targetGroups || [],
        accessRequirements: classification.accessRequirements,
        services: classification.services || [],
        eligibilityCriteria: classification.eligibilityCriteria,
        confidenceScore: classification.confidenceScore || 0,
        classificationMetadata: {
          aiModel: 'gpt-4-turbo-preview',
          promptVersion: this.promptVersion,
          processingTime,
          rawTextAnalyzed: textContent.substring(0, 500),
          keywordsFound: classification.keywordsFound || [],
          alternativeCategories: classification.alternativeCategories || [],
          qualityFlags: classification.qualityFlags || []
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return classifiedResource;

    } catch (error) {
      logger.error(`Classification error for record ${rawRecord.id}`, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  private async callClassificationAPI(textContent: string): Promise<any> {
    const prompt = CLASSIFICATION_PROMPT + textContent;

    try {
        if (!openai) throw new Error('OpenAI not configured');

        const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a precise resource classifier. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      return JSON.parse(content);

    } catch (error) {
      if (error instanceof SyntaxError) {
        logger.error('Invalid JSON response from OpenAI', { content: error.message });
      } else {
        logger.error('OpenAI API call failed', { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
      throw error;
    }
  }

  private extractTextForAnalysis(rawRecord: RawResourceRecord): string {
    const data = rawRecord.rawData;
    
    // Combine relevant fields into analysis text
    const fields = [
      data.name || data.organization_name || data.facility_name || data.agency_name,
      data.description || data.service_description || data.program_description,
      data.services || data.service_types || data.program_model,
      data.category || data.service_area || data.facility_type,
      data.target_population || data.population_served,
      data.eligibility || data.eligibility_requirements,
      data.notes || data.additional_info
    ];

    return fields
      .filter(field => field && typeof field === 'string')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 2000); // Limit to 2000 chars to control API costs
  }

  private extractResourceName(rawRecord: RawResourceRecord): string {
    const data = rawRecord.rawData;
    return data.name || 
           data.organization_name || 
           data.facility_name || 
           data.agency_name || 
           data.program_name || 
           'Unnamed Resource';
  }

  private extractDescription(rawRecord: RawResourceRecord): string {
    const data = rawRecord.rawData;
    return data.description || 
           data.service_description || 
           data.program_description || 
           data.notes || 
           '';
  }

  private extractAddress(rawRecord: RawResourceRecord): string {
    const data = rawRecord.rawData;
    
    // Handle different address formats
    if (data.address) return data.address;
    if (data.physical_address) return data.physical_address;
    if (data.site_address) return data.site_address;
    if (data.location_address) return data.location_address;
    
    // Construct from components
    const parts = [
      data.address_1 || data.street_address,
      data.address_2,
      data.city,
      data.state,
      data.zip_code || data.zipcode
    ].filter(Boolean);
    
    return parts.join(', ');
  }

  private extractPhone(rawRecord: RawResourceRecord): string | undefined {
    const data = rawRecord.rawData;
    return data.phone || 
           data.phone_number || 
           data.contact_phone || 
           data.telephone ||
           (data.phones && data.phones[0]?.number);
  }

  private extractEmail(rawRecord: RawResourceRecord): string | undefined {
    const data = rawRecord.rawData;
    return data.email || 
           data.email_address || 
           data.contact_email;
  }

  private extractWebsite(rawRecord: RawResourceRecord): string | undefined {
    const data = rawRecord.rawData;
    return data.website || 
           data.website_url || 
           data.url || 
           data.web_address;
  }

  private extractHours(rawRecord: RawResourceRecord): string | undefined {
    const data = rawRecord.rawData;
    return data.hours || 
           data.hours_of_operation || 
           data.operating_hours || 
           data.schedule;
  }

  private async saveClassifiedResource(resource: ClassifiedResource): Promise<void> {
    try {
      await prisma.classifiedResource.upsert({
        where: { id: resource.id },
        update: {
          category: resource.category,
          subcategory: resource.subcategory,
          description: resource.description,
          phone: resource.phone,
          email: resource.email,
          website: resource.website,
          hours: resource.hours,
          targetGroups: resource.targetGroups,
          accessRequirements: resource.accessRequirements,
          services: resource.services,
          eligibilityCriteria: resource.eligibilityCriteria,
          confidenceScore: resource.confidenceScore,
          classificationMetadata: resource.classificationMetadata,
          updatedAt: new Date()
        },
        create: {
          id: resource.id,
          rawRecordId: resource.rawRecordId,
          name: resource.name,
          category: resource.category,
          subcategory: resource.subcategory,
          description: resource.description,
          address: resource.address,
          phone: resource.phone,
          email: resource.email,
          website: resource.website,
          hours: resource.hours,
          targetGroups: resource.targetGroups,
          accessRequirements: resource.accessRequirements,
          services: resource.services,
          eligibilityCriteria: resource.eligibilityCriteria,
          confidenceScore: resource.confidenceScore,
          classificationMetadata: resource.classificationMetadata,
          createdAt: resource.createdAt,
          updatedAt: resource.updatedAt
        }
      });

      logger.debug(`Saved classified resource: ${resource.name} (${resource.category})`);
    } catch (error) {
      logger.error(`Failed to save classified resource ${resource.id}`, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Batch classification for efficiency
  async batchClassify(batchSize: number = 25): Promise<void> {
    logger.info('Starting batch classification process');
    
    let totalProcessed = 0;
    let hasMoreRecords = true;

    while (hasMoreRecords) {
      const classified = await this.classifyRawRecords(batchSize);
      
      if (classified.length === 0) {
        hasMoreRecords = false;
      } else {
        totalProcessed += classified.length;
        logger.info(`Batch complete: ${classified.length} records classified (total: ${totalProcessed})`);
        
        // Pause between batches to avoid rate limits
        await this.delay(5000);
      }
    }

    logger.info(`Batch classification complete: ${totalProcessed} total records processed`);
  }

  // Get classification statistics
  async getClassificationStats(): Promise<any> {
    const totalClassified = await prisma.classifiedResource.count();
    
    const categoryStats = await prisma.classifiedResource.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });

    const avgConfidence = await prisma.classifiedResource.aggregate({
      _avg: { confidenceScore: true }
    });

    const recentlyClassified = await prisma.classifiedResource.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    return {
      totalClassified,
      recentlyClassified,
      averageConfidence: avgConfidence._avg.confidenceScore || 0,
      categoryDistribution: categoryStats,
      processingStats: this.processingStats
    };
  }

  // Re-classify resources with low confidence scores
  async reclassifyLowConfidenceResources(confidenceThreshold: number = 70): Promise<void> {
    logger.info(`Re-classifying resources with confidence < ${confidenceThreshold}`);

    const lowConfidenceResources = await prisma.classifiedResource.findMany({
      where: {
        confidenceScore: { lt: confidenceThreshold }
      },
      include: {
        rawRecord: true
      },
      take: 100 // Limit to avoid excessive API usage
    });

    logger.info(`Found ${lowConfidenceResources.length} low-confidence resources to re-classify`);

    for (const resource of lowConfidenceResources) {
      try {
        const newClassification = await this.classifyRecord(resource.rawRecord);
        
        if (newClassification && newClassification.confidenceScore > resource.confidenceScore) {
          await this.saveClassifiedResource(newClassification);
          logger.info(`Improved classification for ${resource.name}: ${resource.confidenceScore} -> ${newClassification.confidenceScore}`);
        }

        await this.delay(1000);
      } catch (error) {
        logger.error(`Re-classification failed for ${resource.id}`, {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }
}

// Export singleton instance
export const resourceClassifier = new ResourceClassifier();