import cron from 'node-cron';
import logger from '../config/logger';
import { PrismaClient } from '@prisma/client';
import { ResourceIngestionEngine } from '../ingestion/resource-ingestion';
import { resourceClassifier } from '../ai/resource-classifier';
import { geolocationMapper } from '../geolocation/geocode-mapper';
import { resourceRanking, WeightingProfile } from '../ranking/resource-ranking';

const prisma = new PrismaClient();

export interface RefreshJobConfig {
  schedule: string;           // Cron expression
  enabled: boolean;
  jobName: string;
  description: string;
  priority: number;           // 1-10 (10 highest)
  maxRuntimeMinutes: number;
  retryAttempts: number;
  timeoutMinutes: number;
  dependencies?: string[];    // Other jobs that must complete first
}

export interface RefreshJobResult {
  jobName: string;
  startTime: Date;
  endTime: Date;
  success: boolean;
  recordsProcessed: number;
  errorCount: number;
  duration: number;
  memoryUsage: number;
  errors?: string[];
  metrics?: Record<string, any>;
}

export interface RefreshSchedule {
  daily: RefreshJobConfig[];
  weekly: RefreshJobConfig[];
  monthly: RefreshJobConfig[];
}

// Job configurations
const REFRESH_JOBS: RefreshSchedule = {
  // Daily jobs at 2 AM local time
  daily: [
    {
      schedule: '0 2 * * *',
      enabled: true,
      jobName: 'data_ingestion',
      description: 'Ingest new resources from configured data sources',
      priority: 10,
      maxRuntimeMinutes: 120,
      retryAttempts: 2,
      timeoutMinutes: 150
    },
    {
      schedule: '0 3 * * *',
      enabled: true,
      jobName: 'classification',
      description: 'Classify newly ingested raw resources using AI',
      priority: 9,
      maxRuntimeMinutes: 90,
      retryAttempts: 3,
      timeoutMinutes: 120,
      dependencies: ['data_ingestion']
    },
    {
      schedule: '0 4 * * *',
      enabled: true,
      jobName: 'geocoding',
      description: 'Geocode classified resources without location data',
      priority: 8,
      maxRuntimeMinutes: 60,
      retryAttempts: 2,
      timeoutMinutes: 90,
      dependencies: ['classification']
    },
    {
      schedule: '0 5 * * *',
      enabled: true,
      jobName: 'ranking',
      description: 'Rank geocoded resources using comprehensive algorithm',
      priority: 7,
      maxRuntimeMinutes: 45,
      retryAttempts: 1,
      timeoutMinutes: 60,
      dependencies: ['geocoding']
    },
    {
      schedule: '0 6 * * *',
      enabled: true,
      jobName: 'quality_improvement',
      description: 'Improve low-quality classifications and geocoding',
      priority: 5,
      maxRuntimeMinutes: 60,
      retryAttempts: 1,
      timeoutMinutes: 90,
      dependencies: ['ranking']
    }
  ],
  
  // Weekly jobs on Sunday at 1 AM
  weekly: [
    {
      schedule: '0 1 * * 0',
      enabled: true,
      jobName: 'full_data_refresh',
      description: 'Complete refresh of all data sources',
      priority: 9,
      maxRuntimeMinutes: 300,
      retryAttempts: 1,
      timeoutMinutes: 360
    },
    {
      schedule: '0 7 * * 0',
      enabled: true,
      jobName: 'comprehensive_reranking',
      description: 'Re-rank all resources with updated algorithm',
      priority: 6,
      maxRuntimeMinutes: 120,
      retryAttempts: 1,
      timeoutMinutes: 150,
      dependencies: ['full_data_refresh']
    },
    {
      schedule: '0 8 * * 0',
      enabled: true,
      jobName: 'data_quality_analysis',
      description: 'Analyze and report on data quality metrics',
      priority: 4,
      maxRuntimeMinutes: 30,
      retryAttempts: 1,
      timeoutMinutes: 45
    }
  ],
  
  // Monthly jobs on 1st day at midnight
  monthly: [
    {
      schedule: '0 0 1 * *',
      enabled: true,
      jobName: 'archive_old_data',
      description: 'Archive resources older than 1 year',
      priority: 3,
      maxRuntimeMinutes: 60,
      retryAttempts: 1,
      timeoutMinutes: 90
    },
    {
      schedule: '0 1 1 * *',
      enabled: true,
      jobName: 'database_optimization',
      description: 'Optimize database performance and cleanup',
      priority: 2,
      maxRuntimeMinutes: 90,
      retryAttempts: 1,
      timeoutMinutes: 120
    }
  ]
};

export class ResourceRefreshScheduler {
  private activeJobs = new Map<string, NodeJS.Timeout>();
  private jobHistory: RefreshJobResult[] = [];
  private isProcessing = false;
  private maxHistorySize = 1000;

  constructor() {
    this.initializeScheduler();
  }

  private initializeScheduler(): void {
    logger.info('Initializing Resource Refresh Scheduler');
    
    // Schedule all configured jobs
    this.scheduleJobs(REFRESH_JOBS.daily, 'daily');
    this.scheduleJobs(REFRESH_JOBS.weekly, 'weekly');
    this.scheduleJobs(REFRESH_JOBS.monthly, 'monthly');
    
    // Health check job every hour
    cron.schedule('0 * * * *', () => {
      this.performHealthCheck();
    });
    
    logger.info('Resource Refresh Scheduler initialized successfully');
  }

  private scheduleJobs(jobs: RefreshJobConfig[], frequency: string): void {
    jobs.forEach(jobConfig => {
      if (!jobConfig.enabled) {
        logger.info(`Skipping disabled job: ${jobConfig.jobName}`);
        return;
      }

      const task = cron.schedule(jobConfig.schedule, async () => {
        await this.executeJob(jobConfig);
      }, {
        scheduled: false,
        timezone: 'America/Los_Angeles' // Adjust timezone as needed
      });

      task.start();
      this.activeJobs.set(jobConfig.jobName, task);
      
      logger.info(`Scheduled ${frequency} job: ${jobConfig.jobName} (${jobConfig.schedule})`);
    });
  }

  async executeJob(config: RefreshJobConfig): Promise<RefreshJobResult> {
    const startTime = new Date();
    const startMemory = process.memoryUsage().heapUsed;
    
    logger.info(`Starting job: ${config.jobName}`);

    // Check dependencies
    if (config.dependencies && config.dependencies.length > 0) {
      const dependencyCheck = await this.checkDependencies(config.dependencies);
      if (!dependencyCheck.success) {
        logger.error(`Job ${config.jobName} failed dependency check: ${dependencyCheck.message}`);
        return this.createJobResult(config, startTime, false, 0, 1, startMemory, [dependencyCheck.message]);
      }
    }

    let result: RefreshJobResult;
    
    try {
      // Execute job with timeout
      const jobPromise = this.executeJobLogic(config);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Job timeout')), config.timeoutMinutes * 60 * 1000);
      });

      const jobResult = await Promise.race([jobPromise, timeoutPromise]);
      result = this.createJobResult(config, startTime, true, jobResult.recordsProcessed, 0, startMemory, [], jobResult.metrics);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Job ${config.jobName} failed:`, errorMessage);
      
      result = this.createJobResult(config, startTime, false, 0, 1, startMemory, [errorMessage]);
      
      // Retry logic
      if (config.retryAttempts > 0) {
        logger.info(`Retrying job ${config.jobName} (attempts remaining: ${config.retryAttempts})`);
        await this.delay(30000); // Wait 30 seconds before retry
        
        const retryConfig = { ...config, retryAttempts: config.retryAttempts - 1 };
        return this.executeJob(retryConfig);
      }
    }

    // Store job result
    this.jobHistory.push(result);
    if (this.jobHistory.length > this.maxHistorySize) {
      this.jobHistory = this.jobHistory.slice(-this.maxHistorySize);
    }

    // Save to database
    await this.saveJobResult(result);

    logger.info(`Job ${config.jobName} completed: ${result.success ? 'SUCCESS' : 'FAILED'} (${result.duration}ms)`);
    
    return result;
  }

  private async executeJobLogic(config: RefreshJobConfig): Promise<{ recordsProcessed: number; metrics?: any }> {
    switch (config.jobName) {
      case 'data_ingestion':
        return await this.runDataIngestion();
      
      case 'classification':
        return await this.runClassification();
      
      case 'geocoding':
        return await this.runGeocoding();
      
      case 'ranking':
        return await this.runRanking();
      
      case 'quality_improvement':
        return await this.runQualityImprovement();
      
      case 'full_data_refresh':
        return await this.runFullDataRefresh();
      
      case 'comprehensive_reranking':
        return await this.runComprehensiveReranking();
      
      case 'data_quality_analysis':
        return await this.runDataQualityAnalysis();
      
      case 'archive_old_data':
        return await this.runArchiveOldData();
      
      case 'database_optimization':
        return await this.runDatabaseOptimization();
      
      default:
        throw new Error(`Unknown job: ${config.jobName}`);
    }
  }

  // Job implementation methods
  private async runDataIngestion(): Promise<{ recordsProcessed: number; metrics: any }> {
    const engine = new ResourceIngestionEngine();
    const results = await engine.ingestFromAllSources(500); // Limit per source
    
    const totalRecords = results.reduce((sum, result) => sum + result.newRecords, 0);
    const totalErrors = results.reduce((sum, result) => sum + result.errors.length, 0);
    
    return {
      recordsProcessed: totalRecords,
      metrics: {
        sourcesProcessed: results.length,
        totalErrors,
        successfulSources: results.filter(r => r.success).length
      }
    };
  }

  private async runClassification(): Promise<{ recordsProcessed: number; metrics: any }> {
    const classified = await resourceClassifier.classifyRawRecords(300);
    const stats = await resourceClassifier.getClassificationStats();
    
    return {
      recordsProcessed: classified.length,
      metrics: {
        averageConfidence: stats.averageConfidence,
        categoryDistribution: stats.categoryDistribution
      }
    };
  }

  private async runGeocoding(): Promise<{ recordsProcessed: number; metrics: any }> {
    const geocoded = await geolocationMapper.geocodeUnmappedResources(200);
    const stats = await geolocationMapper.getGeocodingStats();
    
    return {
      recordsProcessed: geocoded.length,
      metrics: {
        qualityDistribution: stats.qualityDistribution,
        providerDistribution: stats.providerDistribution
      }
    };
  }

  private async runRanking(): Promise<{ recordsProcessed: number; metrics: any }> {
    const ranked = await resourceRanking.rankUnrankedResources(250, WeightingProfile.COMPREHENSIVE);
    const stats = await resourceRanking.getRankingStats();
    
    return {
      recordsProcessed: ranked.length,
      metrics: {
        averageScore: stats.scoreDistribution._avg.overallScore,
        priorityDistribution: stats.priorityDistribution
      }
    };
  }

  private async runQualityImprovement(): Promise<{ recordsProcessed: number; metrics: any }> {
    // Improve low-confidence classifications
    await resourceClassifier.reclassifyLowConfidenceResources(70);
    
    // Improve poor geocoding
    await geolocationMapper.improveGeocodingQuality();
    
    // Re-rank low-scoring resources
    await resourceRanking.reRankResources(40);
    
    return {
      recordsProcessed: 0, // Improvement count not easily tracked
      metrics: {
        improvementType: 'quality_enhancement'
      }
    };
  }

  private async runFullDataRefresh(): Promise<{ recordsProcessed: number; metrics: any }> {
    logger.info('Starting full data refresh');
    
    // Run all pipeline stages in sequence
    const ingestion = await this.runDataIngestion();
    await this.delay(5000);
    
    const classification = await this.runClassification();
    await this.delay(5000);
    
    const geocoding = await this.runGeocoding();
    await this.delay(5000);
    
    const ranking = await this.runRanking();
    
    return {
      recordsProcessed: ingestion.recordsProcessed + classification.recordsProcessed + 
                       geocoding.recordsProcessed + ranking.recordsProcessed,
      metrics: {
        pipeline: 'full_refresh',
        ingestion: ingestion.recordsProcessed,
        classification: classification.recordsProcessed,
        geocoding: geocoding.recordsProcessed,
        ranking: ranking.recordsProcessed
      }
    };
  }

  private async runComprehensiveReranking(): Promise<{ recordsProcessed: number; metrics: any }> {
    await resourceRanking.batchRanking(100, WeightingProfile.COMPREHENSIVE);
    
    const stats = await resourceRanking.getRankingStats();
    
    return {
      recordsProcessed: stats.totalRanked,
      metrics: {
        reRankingType: 'comprehensive',
        averageScore: stats.scoreDistribution._avg.overallScore
      }
    };
  }

  private async runDataQualityAnalysis(): Promise<{ recordsProcessed: number; metrics: any }> {
    // Analyze data quality across pipeline
    const rawCount = await prisma.rawResourceRecord.count();
    const classifiedCount = await prisma.classifiedResource.count();
    const geocodedCount = await prisma.geocodedResource.count();
    const rankedCount = await prisma.rankedResource.count();
    
    const qualityMetrics = {
      classificationRate: (classifiedCount / rawCount) * 100,
      geocodingRate: (geocodedCount / classifiedCount) * 100,
      rankingRate: (rankedCount / geocodedCount) * 100,
      overallCompletionRate: (rankedCount / rawCount) * 100
    };
    
    logger.info('Data Quality Analysis:', qualityMetrics);
    
    return {
      recordsProcessed: rawCount,
      metrics: qualityMetrics
    };
  }

  private async runArchiveOldData(): Promise<{ recordsProcessed: number; metrics: any }> {
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    
    // Archive old raw records that haven't been updated
    const archivedCount = await prisma.rawResourceRecord.updateMany({
      where: {
        updatedAt: { lt: oneYearAgo },
        archived: { not: true }
      },
      data: { archived: true }
    });
    
    return {
      recordsProcessed: archivedCount.count,
      metrics: {
        archiveThreshold: oneYearAgo.toISOString()
      }
    };
  }

  private async runDatabaseOptimization(): Promise<{ recordsProcessed: number; metrics: any }> {
    logger.info('Running database optimization');
    
    // Clean up orphaned records
    const cleanupResult = await this.cleanupOrphanedRecords();
    
    // Update statistics (if using PostgreSQL)
    try {
      await prisma.$executeRaw`ANALYZE`;
      logger.info('Database statistics updated');
    } catch (error) {
      logger.warn('Could not update database statistics:', error);
    }
    
    return {
      recordsProcessed: cleanupResult.cleaned,
      metrics: {
        optimizationType: 'cleanup_and_analyze',
        orphanedRecords: cleanupResult.cleaned
      }
    };
  }

  // Utility methods
  private async checkDependencies(dependencies: string[]): Promise<{ success: boolean; message?: string }> {
    const recentJobs = this.jobHistory.filter(
      job => Date.now() - job.endTime.getTime() < 24 * 60 * 60 * 1000
    );
    
    for (const dependency of dependencies) {
      const dependentJob = recentJobs.find(job => job.jobName === dependency && job.success);
      if (!dependentJob) {
        return {
          success: false,
          message: `Dependency ${dependency} not completed successfully in last 24 hours`
        };
      }
    }
    
    return { success: true };
  }

  private async cleanupOrphanedRecords(): Promise<{ cleaned: number }> {
    // Clean up classified resources without raw records
    const orphanedClassified = await prisma.classifiedResource.deleteMany({
      where: {
        rawRecord: null
      }
    });
    
    // Clean up geocoded resources without classified resources
    const orphanedGeocoded = await prisma.geocodedResource.deleteMany({
      where: {
        classifiedResource: null
      }
    });
    
    // Clean up ranked resources without geocoded resources
    const orphanedRanked = await prisma.rankedResource.deleteMany({
      where: {
        geocodedResource: null
      }
    });
    
    const totalCleaned = orphanedClassified.count + orphanedGeocoded.count + orphanedRanked.count;
    
    logger.info(`Cleaned up ${totalCleaned} orphaned records`);
    return { cleaned: totalCleaned };
  }

  private createJobResult(
    config: RefreshJobConfig,
    startTime: Date,
    success: boolean,
    recordsProcessed: number,
    errorCount: number,
    startMemory: number,
    errors?: string[],
    metrics?: any
  ): RefreshJobResult {
    const endTime = new Date();
    const endMemory = process.memoryUsage().heapUsed;
    
    return {
      jobName: config.jobName,
      startTime,
      endTime,
      success,
      recordsProcessed,
      errorCount,
      duration: endTime.getTime() - startTime.getTime(),
      memoryUsage: endMemory - startMemory,
      errors,
      metrics
    };
  }

  private async saveJobResult(result: RefreshJobResult): Promise<void> {
    try {
      await prisma.refreshJobResult.create({
        data: {
          jobName: result.jobName,
          startTime: result.startTime,
          endTime: result.endTime,
          success: result.success,
          recordsProcessed: result.recordsProcessed,
          errorCount: result.errorCount,
          duration: result.duration,
          memoryUsage: result.memoryUsage,
          errors: result.errors || [],
          metrics: result.metrics || {}
        }
      });
    } catch (error) {
      logger.error('Failed to save job result:', error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Health and monitoring methods
  private async performHealthCheck(): Promise<void> {
    const now = Date.now();
    const recentJobs = this.jobHistory.filter(
      job => now - job.endTime.getTime() < 24 * 60 * 60 * 1000
    );
    
    const failedJobs = recentJobs.filter(job => !job.success);
    
    if (failedJobs.length > 0) {
      logger.warn(`Health check: ${failedJobs.length} failed jobs in last 24 hours`);
      
      // Alert on critical job failures
      const criticalFailures = failedJobs.filter(job => 
        ['data_ingestion', 'full_data_refresh'].includes(job.jobName)
      );
      
      if (criticalFailures.length > 0) {
        logger.error('CRITICAL: Essential jobs have failed', {
          failures: criticalFailures.map(job => ({
            name: job.jobName,
            time: job.endTime,
            errors: job.errors
          }))
        });
      }
    }
    
    // Check resource pipeline health
    await this.checkPipelineHealth();
  }

  private async checkPipelineHealth(): Promise<void> {
    const counts = {
      raw: await prisma.rawResourceRecord.count(),
      classified: await prisma.classifiedResource.count(),
      geocoded: await prisma.geocodedResource.count(),
      ranked: await prisma.rankedResource.count()
    };
    
    const ratios = {
      classificationRate: counts.raw > 0 ? (counts.classified / counts.raw) : 0,
      geocodingRate: counts.classified > 0 ? (counts.geocoded / counts.classified) : 0,
      rankingRate: counts.geocoded > 0 ? (counts.ranked / counts.geocoded) : 0
    };
    
    // Alert on low processing rates
    if (ratios.classificationRate < 0.8) {
      logger.warn(`Low classification rate: ${(ratios.classificationRate * 100).toFixed(1)}%`);
    }
    if (ratios.geocodingRate < 0.7) {
      logger.warn(`Low geocoding rate: ${(ratios.geocodingRate * 100).toFixed(1)}%`);
    }
    if (ratios.rankingRate < 0.9) {
      logger.warn(`Low ranking rate: ${(ratios.rankingRate * 100).toFixed(1)}%`);
    }
  }

  // Manual execution methods
  async executeJobManually(jobName: string): Promise<RefreshJobResult> {
    const jobConfig = [
      ...REFRESH_JOBS.daily,
      ...REFRESH_JOBS.weekly,
      ...REFRESH_JOBS.monthly
    ].find(job => job.jobName === jobName);
    
    if (!jobConfig) {
      throw new Error(`Job not found: ${jobName}`);
    }
    
    logger.info(`Manually executing job: ${jobName}`);
    return this.executeJob(jobConfig);
  }

  async getJobStatus(): Promise<{
    activeJobs: string[];
    recentResults: RefreshJobResult[];
    pipelineHealth: any;
  }> {
    const recentResults = this.jobHistory
      .filter(job => Date.now() - job.endTime.getTime() < 7 * 24 * 60 * 60 * 1000)
      .slice(-20);
    
    // Get pipeline counts for health check
    const counts = {
      raw: await prisma.rawResourceRecord.count(),
      classified: await prisma.classifiedResource.count(),
      geocoded: await prisma.geocodedResource.count(),
      ranked: await prisma.rankedResource.count()
    };
    
    return {
      activeJobs: Array.from(this.activeJobs.keys()),
      recentResults,
      pipelineHealth: counts
    };
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    logger.info('Shutting down Resource Refresh Scheduler');
    
    // Stop all cron jobs
    this.activeJobs.forEach((task, jobName) => {
      task.destroy();
      logger.info(`Stopped job: ${jobName}`);
    });
    
    this.activeJobs.clear();
    logger.info('Resource Refresh Scheduler shutdown complete');
  }
}

// Export singleton instance
export const resourceRefreshScheduler = new ResourceRefreshScheduler();