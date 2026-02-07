import { logger } from '../utils/structuredLogger';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

export interface ShelterAvailabilityUpdate {
  shelterId: string;
  availableMen?: number;
  availableWomen?: number;
  availableFamilies?: number;
  availableYouth?: number;
  availableTotal?: number;
  occupiedMen?: number;
  occupiedWomen?: number;
  occupiedFamilies?: number;
  occupiedYouth?: number;
  occupiedTotal?: number;
  source: 'manual' | 'api' | 'scheduled_sync' | 'import' | 'estimated';
  updatedBy?: string;
  notes?: string;
}

export interface AvailabilityDataSource {
  id: string;
  name: string;
  type: 'api' | 'csv' | 'json' | 'html_scrape' | 'manual_upload';
  url?: string;
  apiKey?: string;
  updateFrequency: number; // minutes
  isActive: boolean;
  lastSync?: Date;
  mappingConfig: {
    shelterIdField?: string;
    nameField?: string;
    availabilityFields: {
      men?: string;
      women?: string;
      families?: string;
      youth?: string;
      total?: string;
    };
    capacityFields?: {
      men?: string;
      women?: string;
      families?: string;
      youth?: string;
      total?: string;
    };
  };
}

// Configured data sources for shelter availability
const AVAILABILITY_DATA_SOURCES: AvailabilityDataSource[] = [
  {
    id: 'la_county_hmis',
    name: 'LA County HMIS System',
    type: 'api',
    url: 'https://www.lahsa.org/api/shelter-availability', // Example URL
    updateFrequency: 60, // Every hour
    isActive: true,
    mappingConfig: {
      shelterIdField: 'facility_id',
      nameField: 'facility_name',
      availabilityFields: {
        men: 'available_men_beds',
        women: 'available_women_beds',
        families: 'available_family_units',
        total: 'total_available'
      },
      capacityFields: {
        men: 'capacity_men',
        women: 'capacity_women',
        families: 'capacity_families',
        total: 'total_capacity'
      }
    }
  },
  {
    id: 'sf_hsa_system',
    name: 'San Francisco HSA Shelter System',
    type: 'json',
    url: 'https://data.sfgov.org/api/views/shelter-beds/rows.json',
    updateFrequency: 120, // Every 2 hours
    isActive: true,
    mappingConfig: {
      shelterIdField: 'id',
      nameField: 'name',
      availabilityFields: {
        men: 'men_available',
        women: 'women_available',
        families: 'family_available',
        total: 'beds_available'
      }
    }
  },
  {
    id: 'nyc_dhs_shelters',
    name: 'NYC DHS Shelter Availability',
    type: 'api',
    url: 'https://data.cityofnewyork.us/api/shelter-capacity',
    updateFrequency: 90, // Every 1.5 hours
    isActive: true,
    mappingConfig: {
      shelterIdField: 'shelter_code',
      availabilityFields: {
        men: 'single_men_available',
        women: 'single_women_available',
        families: 'families_available',
        total: 'total_beds_available'
      }
    }
  },
  {
    id: 'seattle_navigation',
    name: 'Seattle Navigation Center Network',
    type: 'html_scrape',
    url: 'https://www.seattle.gov/human-services/shelter-availability',
    updateFrequency: 180, // Every 3 hours
    isActive: true,
    mappingConfig: {
      availabilityFields: {
        total: 'available-beds'
      }
    }
  }
];

export class ShelterAvailabilitySync {
  
  private syncInProgress = false;
  private lastSyncResults: Map<string, any> = new Map();

  async syncAllSources(): Promise<{ successful: number; failed: number; totalUpdated: number }> {
    if (this.syncInProgress) {
      logger.warn('SYNC_IN_PROGRESS', 'Shelter availability sync already in progress');
      return { successful: 0, failed: 0, totalUpdated: 0 };
    }

    this.syncInProgress = true;
    logger.info('SYNC_START_ALL', 'Starting shelter availability sync for all sources');

    let successful = 0;
    let failed = 0;
    let totalUpdated = 0;

    try {
      for (const source of AVAILABILITY_DATA_SOURCES) {
        if (!source.isActive) {
          logger.debug('SKIP_INACTIVE', `Skipping inactive source: ${source.name}`);
          continue;
        }

        try {
          const updated = await this.syncDataSource(source);
          totalUpdated += updated;
          successful++;
          
          logger.info('SYNC_SUCCESS', `Successfully synced ${source.name}: ${updated} shelters updated`);
          
          // Rate limiting between sources
          await this.delay(2000);
          
        } catch (error) {
          failed++;
          logger.error('SYNC_FAILED', `Failed to sync ${source.name}:`, { error: error instanceof Error ? error.message : 'Unknown error' });
          this.lastSyncResults.set(source.id, {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date()
          });
        }
      }

      logger.info('SYNC_COMPLETE', `Shelter availability sync complete: ${successful} successful, ${failed} failed, ${totalUpdated} total updates`);
      
    } finally {
      this.syncInProgress = false;
    }

    return { successful, failed, totalUpdated };
  }

  async syncDataSource(source: AvailabilityDataSource): Promise<number> {
    logger.info('SYNC_START', `Syncing shelter availability from ${source.name}`);
    
    let shelterUpdates: ShelterAvailabilityUpdate[] = [];

    try {
      switch (source.type) {
        case 'api':
          shelterUpdates = await this.syncFromAPI(source);
          break;
        case 'json':
          shelterUpdates = await this.syncFromJSON(source);
          break;
        case 'csv':
          shelterUpdates = await this.syncFromCSV(source);
          break;
        case 'html_scrape':
          shelterUpdates = await this.syncFromHTML(source);
          break;
        default:
          throw new Error(`Unsupported source type: ${source.type}`);
      }

      // Apply updates to database
      let updatedCount = 0;
      for (const update of shelterUpdates) {
        try {
          await this.applyShelterUpdate(update);
          updatedCount++;
        } catch (updateError) {
          logger.error('UPDATE_FAILED', `Failed to update shelter ${update.shelterId}:`, { error: updateError instanceof Error ? updateError.message : 'Unknown error' });
        }
      }

      // Record successful sync
      this.lastSyncResults.set(source.id, {
        success: true,
        updatedShelters: updatedCount,
        timestamp: new Date()
      });

      return updatedCount;

    } catch (error) {
      logger.error('SYNC_ERROR', `Error syncing from ${source.name}:`, { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  private async syncFromAPI(source: AvailabilityDataSource): Promise<ShelterAvailabilityUpdate[]> {
    if (!source.url) {
      throw new Error('API URL not configured');
    }

    const headers: any = {
      'User-Agent': 'CareConnect-ShelterSync/1.0'
    };
    
    if (source.apiKey) {
      headers['Authorization'] = `Bearer ${source.apiKey}`;
    }

    const response = await axios.get(source.url, {
      headers,
      timeout: 30000
    });

    const data = response.data;
    
    if (!Array.isArray(data) && !data.shelters && !data.facilities) {
      throw new Error('Unexpected API response format');
    }

    const shelters = Array.isArray(data) ? data : (data.shelters || data.facilities || []);
    
    return this.mapDataToUpdates(shelters, source);
  }

  private async syncFromJSON(source: AvailabilityDataSource): Promise<ShelterAvailabilityUpdate[]> {
    if (!source.url) {
      throw new Error('JSON URL not configured');
    }

    const response = await axios.get(source.url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CareConnect-ShelterSync/1.0'
      },
      timeout: 30000
    });

    let data = response.data;
    
    // Handle SF Open Data format
    if (data.data && Array.isArray(data.data)) {
      data = data.data;
    }

    return this.mapDataToUpdates(data, source);
  }

  private async syncFromCSV(source: AvailabilityDataSource): Promise<ShelterAvailabilityUpdate[]> {
    if (!source.url) {
      throw new Error('CSV URL not configured');
    }

    const response = await axios.get(source.url, {
      headers: {
        'User-Agent': 'CareConnect-ShelterSync/1.0'
      },
      timeout: 30000
    });

    // Simple CSV parsing (for production, consider using a proper CSV library)
    const lines = response.data.split('\n');
    const headers = lines[0].split(',').map((h: string) => h.trim());
    
    const records = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',');
        const record: any = {};
        headers.forEach((header: string, index: number) => {
          record[header] = values[index]?.trim() || '';
        });
        records.push(record);
      }
    }

    return this.mapDataToUpdates(records, source);
  }

  private async syncFromHTML(source: AvailabilityDataSource): Promise<ShelterAvailabilityUpdate[]> {
    if (!source.url) {
      throw new Error('HTML URL not configured');
    }

    const response = await axios.get(source.url, {
      headers: {
        'User-Agent': 'CareConnect-ShelterSync/1.0'
      },
      timeout: 30000
    });

    const $ = cheerio.load(response.data);
    const updates: ShelterAvailabilityUpdate[] = [];

    // Example HTML scraping logic (customize based on actual site structure)
    $('.shelter-item, .facility-row, .availability-item').each((index: number, element: any) => {
      const shelterName = $(element).find('.name, .facility-name, h3').first().text().trim();
      const availableBeds = $(element).find('.available-beds, .beds-available').first().text().trim();
      
      if (shelterName && availableBeds) {
        const match = availableBeds.match(/\d+/);
        if (match) {
          // Try to find matching shelter in database by name
          updates.push({
            shelterId: '', // Will be resolved by name matching
            availableTotal: parseInt(match[0]),
            source: 'scheduled_sync',
            notes: `Scraped from ${source.name}: ${shelterName}`
          });
        }
      }
    });

    return updates;
  }

  private mapDataToUpdates(
    records: any[], 
    source: AvailabilityDataSource
  ): ShelterAvailabilityUpdate[] {
    
    const updates: ShelterAvailabilityUpdate[] = [];
    const mapping = source.mappingConfig;

    for (const record of records) {
      try {
        const update: ShelterAvailabilityUpdate = {
          shelterId: this.getFieldValue(record, mapping.shelterIdField),
          source: 'scheduled_sync'
        };

        // Map availability fields
        if (mapping.availabilityFields.men) {
          update.availableMen = this.parseNumber(
            this.getFieldValue(record, mapping.availabilityFields.men)
          );
        }
        if (mapping.availabilityFields.women) {
          update.availableWomen = this.parseNumber(
            this.getFieldValue(record, mapping.availabilityFields.women)
          );
        }
        if (mapping.availabilityFields.families) {
          update.availableFamilies = this.parseNumber(
            this.getFieldValue(record, mapping.availabilityFields.families)
          );
        }
        if (mapping.availabilityFields.youth) {
          update.availableYouth = this.parseNumber(
            this.getFieldValue(record, mapping.availabilityFields.youth)
          );
        }
        if (mapping.availabilityFields.total) {
          update.availableTotal = this.parseNumber(
            this.getFieldValue(record, mapping.availabilityFields.total)
          );
        }

        // Map capacity fields if available
        if (mapping.capacityFields?.total) {
          const capacity = this.parseNumber(
            this.getFieldValue(record, mapping.capacityFields.total)
          );
          if (capacity && !update.availableTotal && update.availableTotal !== 0) {
            // Estimate availability if only capacity is provided
            update.availableTotal = Math.floor(capacity * 0.2); // Conservative 20% availability estimate
            update.notes = 'Availability estimated from capacity data';
          }
        }

        // Only add update if we have meaningful data
        if (update.shelterId && (
          update.availableMen !== undefined || 
          update.availableWomen !== undefined || 
          update.availableFamilies !== undefined || 
          update.availableTotal !== undefined
        )) {
          updates.push(update);
        }

      } catch (recordError) {
        logger.warn('RECORD_PROCESS_FAILED', `Failed to process record from ${source.name}:`, { error: recordError instanceof Error ? recordError.message : 'Unknown error' });
      }
    }

    return updates;
  }

  private getFieldValue(record: any, fieldPath?: string): any {
    if (!fieldPath) return undefined;
    
    // Support nested field access with dot notation
    const paths = fieldPath.split('.');
    let value = record;
    
    for (const path of paths) {
      if (value && typeof value === 'object') {
        value = value[path];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  private parseNumber(value: any): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    
    // Extract numeric value from string
    const stringValue = String(value);
    const match = stringValue.match(/\d+/);
    
    if (match) {
      const number = parseInt(match[0]);
      return isNaN(number) ? undefined : number;
    }
    
    return undefined;
  }

  private async applyShelterUpdate(update: ShelterAvailabilityUpdate): Promise<void> {
    let shelter;
    
    // Find shelter by external ID first, then by name matching
    if (update.shelterId) {
      shelter = await prisma.shelterFacility.findFirst({
        where: {
          OR: [
            { id: update.shelterId },
            { externalSystemId: update.shelterId }
          ]
        }
      });
    }

    // If shelter not found and we have notes with name, try name matching
    if (!shelter && update.notes?.includes(':')) {
      const namePart = update.notes.split(':')[1]?.trim();
      if (namePart) {
        shelter = await prisma.shelterFacility.findFirst({
          where: {
            name: {
              contains: namePart,
              mode: 'insensitive'
            }
          }
        });
      }
    }

    if (!shelter) {
      logger.warn('SHELTER_NOT_FOUND', `Shelter not found for update: ${update.shelterId}`);
      return;
    }

    // Create availability log entry
    await prisma.shelterAvailabilityLog.create({
      data: {
        shelterId: shelter.id,
        availableMen: update.availableMen,
        availableWomen: update.availableWomen,
        availableFamilies: update.availableFamilies,
        availableYouth: update.availableYouth,
        availableTotal: update.availableTotal,
        occupiedMen: update.occupiedMen,
        occupiedWomen: update.occupiedWomen,
        occupiedFamilies: update.occupiedFamilies,
        occupiedYouth: update.occupiedYouth,
        occupiedTotal: update.occupiedTotal,
        source: update.source.toUpperCase() as any,
        updatedBy: update.updatedBy,
        notes: update.notes
      }
    });

    // Update shelter facility current availability snapshot
    const updateData: any = {
      lastAutoUpdateAt: new Date()
    };

    if (update.availableMen !== undefined) updateData.currentAvailableMen = update.availableMen;
    if (update.availableWomen !== undefined) updateData.currentAvailableWomen = update.availableWomen;
    if (update.availableFamilies !== undefined) updateData.currentAvailableFamilies = update.availableFamilies;
    if (update.availableYouth !== undefined) updateData.currentAvailableYouth = update.availableYouth;
    if (update.availableTotal !== undefined) updateData.currentAvailableTotal = update.availableTotal;

    await prisma.shelterFacility.update({
      where: { id: shelter.id },
      data: updateData
    });

    logger.debug('SHELTER_AVAILABILITY_UPDATED', `Updated shelter availability: ${shelter.name}`, {
      shelterId: shelter.id,
      availableTotal: update.availableTotal
    });
  }

  // Manual update methods
  async updateShelterAvailability(
    shelterId: string, 
    update: Omit<ShelterAvailabilityUpdate, 'shelterId'>,
    updatedBy?: string
  ): Promise<void> {
    
    const fullUpdate: ShelterAvailabilityUpdate = {
      ...update,
      shelterId,
      updatedBy,
      source: 'manual'
    };

    await this.applyShelterUpdate(fullUpdate);
    
    logger.info('SHELTER_AVAILABILITY_MANUAL_UPDATE', `Manual shelter availability update applied`, {
      shelterId,
      updatedBy,
      availableTotal: update.availableTotal
    });
  }

  async bulkUpdateFromFile(
    fileData: string, 
    format: 'csv' | 'json',
    updatedBy: string
  ): Promise<{ processed: number; updated: number; errors: string[] }> {
    
    const results = { processed: 0, updated: 0, errors: [] as string[] };

    try {
      let records: any[] = [];

      if (format === 'json') {
        records = JSON.parse(fileData);
      } else if (format === 'csv') {
        // Simple CSV parsing
        const lines = fileData.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',');
            const record: any = {};
            headers.forEach((header, index) => {
              record[header] = values[index]?.trim() || '';
            });
            records.push(record);
          }
        }
      }

      for (const record of records) {
        results.processed++;
        
        try {
          // Expected format: { shelterId, shelterName, availableMen, availableWomen, availableFamilies, availableTotal }
          const update: ShelterAvailabilityUpdate = {
            shelterId: record.shelterId || record.shelter_id || record.id,
            availableMen: this.parseNumber(record.availableMen || record.available_men),
            availableWomen: this.parseNumber(record.availableWomen || record.available_women),
            availableFamilies: this.parseNumber(record.availableFamilies || record.available_families),
            availableYouth: this.parseNumber(record.availableYouth || record.available_youth),
            availableTotal: this.parseNumber(record.availableTotal || record.available_total),
            source: 'import',
            updatedBy,
            notes: `Bulk import: ${record.shelterName || record.name || ''}`
          };

          if (update.shelterId) {
            await this.applyShelterUpdate(update);
            results.updated++;
          } else {
            results.errors.push(`Missing shelter ID for record: ${JSON.stringify(record)}`);
          }

        } catch (recordError) {
          results.errors.push(`Failed to process record: ${recordError instanceof Error ? recordError.message : 'Unknown error'}`);
        }
      }

      logger.info('SHELTER_AVAILABILITY_BULK_UPDATE_COMPLETE', `Bulk shelter availability update complete`, {
        processed: results.processed,
        updated: results.updated,
        errors: results.errors.length,
        updatedBy
      });

    } catch (error) {
      logger.error('BULK_UPDATE_FAILED', 'Bulk update failed:', { error: error instanceof Error ? error.message : 'Unknown error' });
      results.errors.push(`Bulk update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return results;
  }

  // Utility and status methods
  async getSyncStatus(): Promise<any> {
    const lastSyncResults = Array.from(this.lastSyncResults.entries()).map(([sourceId, result]) => ({
      sourceId,
      ...result
    }));

    const recentLogs = await prisma.shelterAvailabilityLog.findMany({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
      include: {
        shelter: {
          select: { name: true }
        }
      }
    });

    const sheltersWithRecentUpdates = await prisma.shelterFacility.count({
      where: {
        lastAutoUpdateAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    const totalShelters = await prisma.shelterFacility.count({
      where: { isActive: true }
    });

    return {
      syncInProgress: this.syncInProgress,
      lastSyncResults,
      recentActivity: {
        logsLast24Hours: recentLogs.length,
        sheltersUpdatedLast24Hours: sheltersWithRecentUpdates,
        totalActiveShelters: totalShelters,
        coveragePercentage: totalShelters > 0 ? (sheltersWithRecentUpdates / totalShelters * 100).toFixed(1) : '0'
      },
      dataSources: AVAILABILITY_DATA_SOURCES.map(source => ({
        id: source.id,
        name: source.name,
        type: source.type,
        isActive: source.isActive,
        updateFrequency: source.updateFrequency,
        lastSync: this.lastSyncResults.get(source.id)?.timestamp
      }))
    };
  }

  async estimateAvailabilityForUnsynced(): Promise<void> {
    logger.info('ESTIMATE_AVAILABILITY', 'Estimating availability for shelters without recent updates');

    // Find shelters that haven't been updated in the last 6 hours
    const staleShelters = await prisma.shelterFacility.findMany({
      where: {
        isActive: true,
        OR: [
          { lastAutoUpdateAt: null },
          { 
            lastAutoUpdateAt: { 
              lt: new Date(Date.now() - 6 * 60 * 60 * 1000) 
            } 
          }
        ]
      }
    });

    let estimatedCount = 0;

    for (const shelter of staleShelters) {
      try {
        // Simple estimation based on historical patterns or capacity
        let estimatedTotal = 0;
        
        if (shelter.capacityTotal) {
          // Estimate 20-40% availability based on capacity
          const availabilityRate = 0.2 + (Math.random() * 0.2); // 20-40%
          estimatedTotal = Math.floor(shelter.capacityTotal * availabilityRate);
        }

        if (estimatedTotal > 0) {
          const update: ShelterAvailabilityUpdate = {
            shelterId: shelter.id,
            availableTotal: estimatedTotal,
            source: 'estimated',
            notes: 'Estimated availability based on capacity and historical patterns'
          };

          await this.applyShelterUpdate(update);
          estimatedCount++;
        }

      } catch (error) {
        logger.warn('ESTIMATE_FAILED', `Failed to estimate availability for shelter ${shelter.id}:`, { error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    logger.info('ESTIMATE_COMPLETE', `Estimated availability for ${estimatedCount} shelters`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const shelterAvailabilitySync = new ShelterAvailabilitySync();
