/**
 * Health Check Utility
 * Wrapper around healthCheckRunner for service integration
 */

import { healthCheckRunner } from '../ops/healthCheckRunner';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'error';
  services: Array<{
    name: string;
    healthy: boolean;
    error?: string;
  }>;
}

/**
 * Get current health status for system degradation checks
 */
export async function getHealthStatus(): Promise<HealthStatus> {
  try {
    await healthCheckRunner.runAllChecks();
    const results = healthCheckRunner.getResults();
    
    const services = Array.from(results.entries()).map(([name, result]) => ({
      name,
      healthy: result.healthy,
      error: result.error
    }));

    // Determine overall status
    const hasError = services.some(s => !s.healthy);
    
    let status: 'healthy' | 'degraded' | 'error' = 'healthy';
    if (hasError) status = 'error';

    return {
      status,
      services
    };
  } catch (error) {
    console.error('[HealthCheck] Failed to get status:', error);
    return {
      status: 'error',
      services: []
    };
  }
}
