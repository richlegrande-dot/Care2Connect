import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import Papa from 'papaparse';
import logger from '../config/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface RawResourceRecord {
  id: string;
  source: string;
  sourceUrl: string;
  rawData: any;
  extractedAt: Date;
  city: string;
  state: string;
  zipCode?: string;
  county?: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'api' | 'csv' | 'json' | 'html' | 'xml';
  url: string;
  city: string;
  state: string;
  apiKey?: string;
  refreshFrequency: 'daily' | 'weekly' | 'monthly';
  lastSync?: Date;
  isActive: boolean;
  rateLimitPerHour: number;
  extractionConfig: SourceExtractionConfig;
}

export interface SourceExtractionConfig {
  nameField: string;
  addressField: string;
  phoneField?: string;
  hoursField?: string;
  descriptionField?: string;
  categoryField?: string;
  websiteField?: string;
  emailField?: string;
  targetGroupsField?: string;
  customMappings?: Record<string, string>;
}

// Data source registry for major cities
export const DATA_SOURCES: DataSource[] = [
  // Federal/National Sources
  {
    id: 'hud-national',
    name: 'HUD Housing Inventory Count',
    type: 'api',
    url: 'https://www.hudexchange.info/resource/reportmanagement/published/CoC_HIC_CoC_',
    city: 'nationwide',
    state: 'all',
    refreshFrequency: 'monthly',
    isActive: true,
    rateLimitPerHour: 100,
    extractionConfig: {
      nameField: 'organization_name',
      addressField: 'address',
      phoneField: 'phone_number',
      categoryField: 'program_type',
      targetGroupsField: 'target_population'
    }
  },
  
  // 211 API Sources
  {
    id: '211-la-county',
    name: '211 Los Angeles County',
    type: 'api',
    url: 'https://api.211la.org/api/v1/locations',
    city: 'Los Angeles',
    state: 'CA',
    apiKey: process.env.API_211_LA_KEY,
    refreshFrequency: 'daily',
    isActive: true,
    rateLimitPerHour: 1000,
    extractionConfig: {
      nameField: 'name',
      addressField: 'physical_address',
      phoneField: 'phones.number',
      hoursField: 'schedule',
      descriptionField: 'description',
      websiteField: 'url'
    }
  },
  
  {
    id: '211-sf-bay',
    name: '211 San Francisco Bay Area',
    type: 'api', 
    url: 'https://api.211bayarea.org/api/search',
    city: 'San Francisco',
    state: 'CA',
    apiKey: process.env.API_211_SF_KEY,
    refreshFrequency: 'daily',
    isActive: true,
    rateLimitPerHour: 500,
    extractionConfig: {
      nameField: 'agency_name',
      addressField: 'address_1',
      phoneField: 'phone_number',
      categoryField: 'service_area',
      descriptionField: 'service_description'
    }
  },

  // City Open Data Portals
  {
    id: 'nyc-opendata',
    name: 'NYC Open Data - Social Services',
    type: 'json',
    url: 'https://data.cityofnewyork.us/resource/ichb-cjp3.json',
    city: 'New York',
    state: 'NY',
    refreshFrequency: 'weekly',
    isActive: true,
    rateLimitPerHour: 1000,
    extractionConfig: {
      nameField: 'facility_name',
      addressField: 'address',
      phoneField: 'phone',
      categoryField: 'facility_type',
      hoursField: 'hours_of_operation'
    }
  },

  {
    id: 'chicago-data',
    name: 'Chicago Data Portal - Human Services',
    type: 'json',
    url: 'https://data.cityofchicago.org/resource/4g4n-8jz8.json',
    city: 'Chicago',
    state: 'IL',
    refreshFrequency: 'weekly',
    isActive: true,
    rateLimitPerHour: 2000,
    extractionConfig: {
      nameField: 'agency_name',
      addressField: 'site_address',
      phoneField: 'phone_number',
      categoryField: 'program_model',
      targetGroupsField: 'target_population'
    }
  },

  {
    id: 'seattle-opendata',
    name: 'Seattle Open Data - Human Services',
    type: 'csv',
    url: 'https://data.seattle.gov/api/views/yaai-7frk/rows.csv',
    city: 'Seattle',
    state: 'WA',
    refreshFrequency: 'weekly',
    isActive: true,
    rateLimitPerHour: 500,
    extractionConfig: {
      nameField: 'Organization Name',
      addressField: 'Address',
      phoneField: 'Phone Number',
      categoryField: 'Service Category',
      descriptionField: 'Description'
    }
  },

  // County Sources
  {
    id: 'la-county-services',
    name: 'LA County Human Services Directory',
    type: 'api',
    url: 'https://dpss.lacounty.gov/wps/wcm/connect/dpss/8b2f4e9e-7b5c-4e5d-9f2b-8e8c7b2c8b5c/directory.json',
    city: 'Los Angeles County',
    state: 'CA',
    refreshFrequency: 'weekly',
    isActive: true,
    rateLimitPerHour: 200,
    extractionConfig: {
      nameField: 'program_name',
      addressField: 'location_address',
      phoneField: 'contact_phone',
      categoryField: 'service_type',
      hoursField: 'operating_hours'
    }
  },

  // State-Level Sources
  {
    id: 'ca-homeless-services',
    name: 'California Homeless Services Directory',
    type: 'json',
    url: 'https://www.bcsh.ca.gov/hcfc/documents/coc_contact_list.json',
    city: 'California Statewide',
    state: 'CA',
    refreshFrequency: 'monthly',
    isActive: true,
    rateLimitPerHour: 100,
    extractionConfig: {
      nameField: 'coc_name',
      addressField: 'mailing_address',
      phoneField: 'phone',
      emailField: 'email',
      websiteField: 'website'
    }
  },

  // FindHelp.org Integration
  {
    id: 'findhelp-national',
    name: 'FindHelp.org National Directory',
    type: 'api',
    url: 'https://api.findhelp.org/v1/search/programs',
    city: 'nationwide',
    state: 'all',
    apiKey: process.env.FINDHELP_API_KEY,
    refreshFrequency: 'daily',
    isActive: true,
    rateLimitPerHour: 5000,
    extractionConfig: {
      nameField: 'name',
      addressField: 'addresses.address1',
      phoneField: 'phones.number',
      hoursField: 'hours_of_operation',
      descriptionField: 'description',
      categoryField: 'service_types',
      websiteField: 'website_url'
    }
  }
];

export class ResourceIngestionEngine {
  private requestCounts: Map<string, number> = new Map();
  private lastResetTime: Date = new Date();

  constructor() {
    // Reset rate limit counters every hour
    setInterval(() => {
      this.requestCounts.clear();
      this.lastResetTime = new Date();
    }, 3600000);
  }

  async ingestFromAllSources(cityFilter?: string[]): Promise<void> {
    logger.info('Starting resource ingestion from all sources', { 
      cityFilter,
      totalSources: DATA_SOURCES.length 
    });

    const activeSources = DATA_SOURCES.filter(source => 
      source.isActive && 
      (!cityFilter || cityFilter.some(city => 
        source.city.toLowerCase().includes(city.toLowerCase())
      ))
    );

    logger.info(`Processing ${activeSources.length} active sources`);

    for (const source of activeSources) {
      try {
        if (!this.checkRateLimit(source)) {
          logger.warn(`Rate limit exceeded for source ${source.id}, skipping`);
          continue;
        }

        await this.ingestFromSource(source);
        await this.delay(2000); // 2 second delay between sources
      } catch (error) {
        logger.error(`Failed to ingest from source ${source.id}`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          source: source.name
        });
      }
    }

    logger.info('Resource ingestion completed');
  }

  private checkRateLimit(source: DataSource): boolean {
    const currentCount = this.requestCounts.get(source.id) || 0;
    if (currentCount >= source.rateLimitPerHour) {
      return false;
    }
    this.requestCounts.set(source.id, currentCount + 1);
    return true;
  }

  async ingestFromSource(source: DataSource): Promise<RawResourceRecord[]> {
    logger.info(`Starting ingestion from ${source.name}`, { 
      sourceId: source.id,
      type: source.type 
    });

    let records: RawResourceRecord[] = [];

    try {
      switch (source.type) {
        case 'api':
          records = await this.ingestFromAPI(source);
          break;
        case 'json':
          records = await this.ingestFromJSON(source);
          break;
        case 'csv':
          records = await this.ingestFromCSV(source);
          break;
        case 'xml':
          records = await this.ingestFromXML(source);
          break;
        case 'html':
          records = await this.ingestFromHTML(source);
          break;
        default:
          throw new Error(`Unsupported source type: ${source.type}`);
      }

      // Save raw records to database
      await this.saveRawRecords(records, source);
      
      // Update source sync timestamp
      await this.updateSourceSyncTime(source.id);

      logger.info(`Successfully ingested ${records.length} records from ${source.name}`);
      return records;

    } catch (error) {
      logger.error(`Ingestion failed for ${source.name}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        sourceId: source.id
      });
      throw error;
    }
  }

  private async ingestFromAPI(source: DataSource): Promise<RawResourceRecord[]> {
    const headers: any = {
      'User-Agent': 'CareConnect Resource Mapper/1.0'
    };

    if (source.apiKey) {
      headers['Authorization'] = `Bearer ${source.apiKey}`;
      headers['X-API-Key'] = source.apiKey;
    }

    const response: AxiosResponse = await axios.get(source.url, {
      headers,
      timeout: 30000,
      validateStatus: (status) => status < 500 // Accept 4xx as valid responses
    });

    if (response.status >= 400) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = response.data;
    return this.normalizeAPIResponse(data, source);
  }

  private async ingestFromJSON(source: DataSource): Promise<RawResourceRecord[]> {
    const response = await axios.get(source.url, {
      headers: { 'User-Agent': 'CareConnect Resource Mapper/1.0' },
      timeout: 30000
    });

    const data = Array.isArray(response.data) ? response.data : [response.data];
    return this.normalizeJSONResponse(data, source);
  }

  private async ingestFromCSV(source: DataSource): Promise<RawResourceRecord[]> {
    const response = await axios.get(source.url, {
      headers: { 'User-Agent': 'CareConnect Resource Mapper/1.0' },
      timeout: 30000,
      responseType: 'text'
    });

    return new Promise((resolve, reject) => {
      Papa.parse(response.data, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const records = this.normalizeCSVResponse(results.data, source);
            resolve(records);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => reject(error)
      });
    });
  }

  private async ingestFromXML(source: DataSource): Promise<RawResourceRecord[]> {
    // Placeholder for XML parsing - would use xml2js or similar
    const response = await axios.get(source.url, {
      headers: { 'User-Agent': 'CareConnect Resource Mapper/1.0' },
      timeout: 30000,
      responseType: 'text'
    });

    // Basic XML to JSON conversion would go here
    throw new Error('XML parsing not yet implemented');
  }

  private async ingestFromHTML(source: DataSource): Promise<RawResourceRecord[]> {
    const response = await axios.get(source.url, {
      headers: { 'User-Agent': 'CareConnect Resource Mapper/1.0' },
      timeout: 30000,
      responseType: 'text'
    });

    const $ = cheerio.load(response.data);
    // HTML scraping logic would be implemented here based on source structure
    
    throw new Error('HTML scraping not yet implemented');
  }

  private normalizeAPIResponse(data: any, source: DataSource): RawResourceRecord[] {
    const records: RawResourceRecord[] = [];
    const items = Array.isArray(data) ? data : (data.results || data.data || [data]);

    for (const item of items) {
      const record: RawResourceRecord = {
        id: this.generateRecordId(source, item),
        source: source.id,
        sourceUrl: source.url,
        rawData: item,
        extractedAt: new Date(),
        city: source.city,
        state: source.state,
        zipCode: this.extractField(item, 'zip_code', source.extractionConfig.customMappings),
        county: this.extractField(item, 'county', source.extractionConfig.customMappings)
      };
      records.push(record);
    }

    return records;
  }

  private normalizeJSONResponse(data: any[], source: DataSource): RawResourceRecord[] {
    return data.map(item => ({
      id: this.generateRecordId(source, item),
      source: source.id,
      sourceUrl: source.url,
      rawData: item,
      extractedAt: new Date(),
      city: source.city,
      state: source.state,
      zipCode: this.extractField(item, 'zip_code', source.extractionConfig.customMappings),
      county: this.extractField(item, 'county', source.extractionConfig.customMappings)
    }));
  }

  private normalizeCSVResponse(data: any[], source: DataSource): RawResourceRecord[] {
    return data.map(row => ({
      id: this.generateRecordId(source, row),
      source: source.id,
      sourceUrl: source.url,
      rawData: row,
      extractedAt: new Date(),
      city: source.city,
      state: source.state,
      zipCode: row['ZIP Code'] || row['Zip Code'] || row['zip_code'],
      county: row['County'] || row['county']
    }));
  }

  private generateRecordId(source: DataSource, item: any): string {
    // Generate a consistent ID based on source and item data
    const key = item.id || item.name || item.organization_name || JSON.stringify(item).substring(0, 50);
    return `${source.id}-${Buffer.from(key).toString('base64').substring(0, 16)}`;
  }

  private extractField(item: any, fieldName: string, customMappings?: Record<string, string>): any {
    if (customMappings && customMappings[fieldName]) {
      fieldName = customMappings[fieldName];
    }
    
    // Handle nested field access (e.g., "address.street")
    if (fieldName.includes('.')) {
      const parts = fieldName.split('.');
      let value = item;
      for (const part of parts) {
        if (value && typeof value === 'object') {
          value = value[part];
        } else {
          return null;
        }
      }
      return value;
    }
    
    return item[fieldName];
  }

  private async saveRawRecords(records: RawResourceRecord[], source: DataSource): Promise<void> {
    // Batch insert raw records to database
    const batchSize = 100;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      try {
        // Using upsert to handle duplicates
        for (const record of batch) {
          await prisma.rawResourceRecord.upsert({
            where: { id: record.id },
            update: {
              rawData: record.rawData,
              extractedAt: record.extractedAt,
            },
            create: {
              id: record.id,
              source: record.source,
              sourceUrl: record.sourceUrl,
              rawData: record.rawData,
              extractedAt: record.extractedAt,
              city: record.city,
              state: record.state,
              zipCode: record.zipCode,
              county: record.county
            }
          });
        }

        logger.debug(`Saved batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(records.length/batchSize)} for ${source.name}`);
      } catch (error) {
        logger.error(`Failed to save batch for ${source.name}`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          batchStart: i,
          batchSize: batch.length
        });
      }
    }
  }

  private async updateSourceSyncTime(sourceId: string): Promise<void> {
    try {
      await prisma.dataSource.upsert({
        where: { id: sourceId },
        update: { lastSync: new Date() },
        create: {
          id: sourceId,
          name: DATA_SOURCES.find(s => s.id === sourceId)?.name || sourceId,
          lastSync: new Date(),
          isActive: true
        }
      });
    } catch (error) {
      logger.error(`Failed to update sync time for ${sourceId}`, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public method to get ingestion statistics
  async getIngestionStats(): Promise<any> {
    const stats = await prisma.rawResourceRecord.groupBy({
      by: ['source', 'city', 'state'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });

    const totalRecords = await prisma.rawResourceRecord.count();
    const lastUpdate = await prisma.rawResourceRecord.findFirst({
      orderBy: { extractedAt: 'desc' },
      select: { extractedAt: true }
    });

    return {
      totalRecords,
      lastUpdate: lastUpdate?.extractedAt,
      bySource: stats,
      activeSources: DATA_SOURCES.filter(s => s.isActive).length,
      totalSources: DATA_SOURCES.length
    };
  }
}

// Factory function for creating the ingestion engine
export function createIngestionEngine(): ResourceIngestionEngine {
  return new ResourceIngestionEngine();
}

// Export singleton instance
export const ingestionEngine = new ResourceIngestionEngine();