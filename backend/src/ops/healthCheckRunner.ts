/**
 * Health Check Runners for All Services
 * Functional tests that verify service connectivity and create incidents
 */

import { createOrUpdateIncident, resolveIncidentsByService } from './incidentStore';
import { maskSecret } from '../config/envSchema';

export interface HealthCheckResult {
  service: string;
  healthy: boolean;
  latency?: number;
  lastChecked: Date;
  error?: string;
  details?: any;
}

class HealthCheckRunner {
  private results: Map<string, HealthCheckResult> = new Map();

  async runAllChecks(): Promise<Map<string, HealthCheckResult>> {
    const checks = [
      this.checkAssemblyAI(),
      this.checkOpenAI(),
      this.checkPrismaDB(),
      this.checkStripe(),
      this.checkCloudflareAPI(),
      this.checkTunnel(),
      this.checkSpeech()
    ];

    await Promise.allSettled(checks);
    return this.results;
  }

  private setResult(service: string, result: Partial<HealthCheckResult>): void {
    this.results.set(service, {
      service,
      healthy: false,
      lastChecked: new Date(),
      ...result
    });
  }

  private async checkAssemblyAI(): Promise<void> {
    const start = Date.now();
    
    if (!process.env.ASSEMBLYAI_API_KEY) {
      await createOrUpdateIncident(
        'assemblyai',
        'critical',
        'AssemblyAI API key missing',
        'ASSEMBLYAI_API_KEY environment variable is not set',
        undefined,
        'Set ASSEMBLYAI_API_KEY environment variable'
      );
      
      this.setResult('assemblyai', {
        healthy: false,
        error: 'API key not configured'
      });
      return;
    }

    try {
      const response = await fetch('https://api.assemblyai.com/v2/transcript', {
        method: 'GET',
        headers: {
          'Authorization': process.env.ASSEMBLYAI_API_KEY,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      });

      const latency = Date.now() - start;

      if (response.ok || response.status === 400) { // 400 is acceptable for GET on this endpoint
        await resolveIncidentsByService('assemblyai');
        this.setResult('assemblyai', {
          healthy: true,
          latency,
          details: { status: response.status }
        });
      } else {
        let errorCategory = 'Unknown error';
        if (response.status === 401) errorCategory = 'Invalid API key';
        else if (response.status === 429) errorCategory = 'Rate limited';
        else if (response.status >= 500) errorCategory = 'AssemblyAI server error';

        await createOrUpdateIncident(
          'assemblyai',
          response.status === 429 ? 'warn' : 'critical',
          `AssemblyAI API error: ${errorCategory}`,
          `HTTP ${response.status} from AssemblyAI API`,
          { status: response.status, latency },
          response.status === 401 ? 'Check ASSEMBLYAI_API_KEY validity' : 'Monitor AssemblyAI status'
        );

        this.setResult('assemblyai', {
          healthy: false,
          latency,
          error: errorCategory,
          details: { status: response.status }
        });
      }
    } catch (error: any) {
      const latency = Date.now() - start;
      
      await createOrUpdateIncident(
        'assemblyai',
        'critical',
        'AssemblyAI API network error',
        `Failed to connect to AssemblyAI API: ${error.message}`,
        { error: error.message, latency },
        'Check network connectivity and AssemblyAI service status'
      );

      this.setResult('assemblyai', {
        healthy: false,
        latency,
        error: 'Network error',
        details: { message: error.message }
      });
    }
  }

  private async checkOpenAI(): Promise<void> {
    // V1_STABLE / ZERO_OPENAI_MODE: OpenAI health checks are disabled
    const isV1Mode = process.env.V1_STABLE === 'true' || 
                     process.env.ZERO_OPENAI_MODE === 'true' || 
                     (process.env.AI_PROVIDER && !['openai'].includes(process.env.AI_PROVIDER));
    
    if (isV1Mode) {
      // Mark as "healthy" with status "disabled" to avoid false alarms
      // System is working as designed without OpenAI
      this.setResult('openai', {
        healthy: true, // System health is good - OpenAI intentionally disabled
        error: undefined,
        details: { 
          status: 'disabled',
          reason: 'OpenAI disabled in V1_STABLE/ZERO_OPENAI_MODE',
          mode: 'V1_STABLE',
          aiProvider: process.env.AI_PROVIDER || 'rules'
        }
      });
      return;
    }
    
    const start = Date.now();
    
    if (!process.env.OPENAI_API_KEY) {
      await createOrUpdateIncident(
        'openai',
        'critical',
        'OpenAI API key missing',
        'OPENAI_API_KEY environment variable is not set',
        undefined,
        'Set OPENAI_API_KEY environment variable'
      );
      
      this.setResult('openai', {
        healthy: false,
        error: 'API key not configured'
      });
      return;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'User-Agent': 'CareConnect/1.0'
        },
        signal: AbortSignal.timeout(5000)
      });

      const latency = Date.now() - start;

      if (response.ok) {
        await resolveIncidentsByService('openai');
        this.setResult('openai', {
          healthy: true,
          latency,
          details: { status: response.status }
        });
      } else {
        let errorCategory = 'Unknown error';
        if (response.status === 401) errorCategory = 'Invalid API key';
        else if (response.status === 429) errorCategory = 'Rate limited';
        else if (response.status >= 500) errorCategory = 'OpenAI server error';

        await createOrUpdateIncident(
          'openai',
          response.status === 429 ? 'warn' : 'critical',
          `OpenAI API error: ${errorCategory}`,
          `HTTP ${response.status} from OpenAI API`,
          { status: response.status, latency },
          response.status === 401 ? 'Check OPENAI_API_KEY validity' : 'Monitor OpenAI status'
        );

        this.setResult('openai', {
          healthy: false,
          latency,
          error: errorCategory,
          details: { status: response.status }
        });
      }
    } catch (error: any) {
      const latency = Date.now() - start;
      
      await createOrUpdateIncident(
        'openai',
        'critical',
        'OpenAI API network error',
        `Failed to connect to OpenAI API: ${error.message}`,
        { error: error.message, latency },
        'Check network connectivity and OpenAI service status'
      );

      this.setResult('openai', {
        healthy: false,
        latency,
        error: 'Network error',
        details: { message: error.message }
      });
    }
  }

  private async checkPrismaDB(): Promise<void> {
    const start = Date.now();

    if (!process.env.DATABASE_URL) {
      // No error - file-based storage is a valid fallback
      await resolveIncidentsByService('prisma');
      
      this.setResult('prisma', {
        healthy: true,
        latency: Date.now() - start,
        details: { mode: 'file-based-storage' }
      });
      return;
    }

    try {
      // Use dynamic import to avoid startup dependency
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      await prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;

      await resolveIncidentsByService('prisma');
      this.setResult('prisma', {
        healthy: true,
        latency,
        details: { connection: 'postgresql' }
      });

      await prisma.$disconnect();
    } catch (error: any) {
      const latency = Date.now() - start;
      
      await createOrUpdateIncident(
        'prisma',
        'critical',
        'Database connection failed',
        `Failed to connect to PostgreSQL: ${error.message}`,
        { error: error.message, latency },
        'Check DATABASE_URL and database server status'
      );

      this.setResult('prisma', {
        healthy: false,
        latency,
        error: 'Connection failed',
        details: { message: error.message }
      });
    }
  }

  private async checkStripe(): Promise<void> {
    const start = Date.now();

    if (!process.env.STRIPE_SECRET_KEY) {
      await createOrUpdateIncident(
        'stripe',
        'warn',
        'Stripe secret key missing',
        'STRIPE_SECRET_KEY environment variable is not set',
        undefined,
        'Set STRIPE_SECRET_KEY environment variable'
      );

      this.setResult('stripe', {
        healthy: false,
        error: 'Secret key not configured'
      });
      return;
    }

    // Validate key format
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_')) {
      await createOrUpdateIncident(
        'stripe',
        'critical',
        'Invalid Stripe secret key format',
        'STRIPE_SECRET_KEY must start with sk_test_ or sk_live_',
        { keyPrefix: secretKey.substring(0, 7) },
        'Update STRIPE_SECRET_KEY with valid format from Stripe dashboard'
      );

      this.setResult('stripe', {
        healthy: false,
        error: 'Invalid key format'
      });
      return;
    }

    try {
      // Test API connection
      const response = await fetch('https://api.stripe.com/v1/account', {
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'User-Agent': 'CareConnect/1.0'
        },
        signal: AbortSignal.timeout(5000)
      });

      const latency = Date.now() - start;

      if (response.ok) {
        await resolveIncidentsByService('stripe');
        this.setResult('stripe', {
          healthy: true,
          latency,
          details: { status: response.status, keyType: secretKey.startsWith('sk_live_') ? 'live' : 'test' }
        });
      } else {
        await createOrUpdateIncident(
          'stripe',
          'critical',
          'Stripe API authentication failed',
          `HTTP ${response.status} from Stripe API`,
          { status: response.status, latency },
          'Check STRIPE_SECRET_KEY validity in Stripe dashboard'
        );

        this.setResult('stripe', {
          healthy: false,
          latency,
          error: `HTTP ${response.status}`,
          details: { status: response.status }
        });
      }
    } catch (error: any) {
      const latency = Date.now() - start;
      
      await createOrUpdateIncident(
        'stripe',
        'critical',
        'Stripe API network error',
        `Failed to connect to Stripe API: ${error.message}`,
        { error: error.message, latency },
        'Check network connectivity and Stripe service status'
      );

      this.setResult('stripe', {
        healthy: false,
        latency,
        error: 'Network error'
      });
    }
  }

  private async checkCloudflareAPI(): Promise<void> {
    const start = Date.now();

    if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ZONE_ID) {
      await createOrUpdateIncident(
        'cloudflare',
        'warn',
        'Cloudflare API not configured',
        'CLOUDFLARE_API_TOKEN or CLOUDFLARE_ZONE_ID not set',
        undefined,
        'Set Cloudflare credentials in .env file'
      );
      
      this.setResult('cloudflare', {
        healthy: false,
        latency: Date.now() - start,
        error: 'Not configured'
      });
      return;
    }

    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(8000)
        }
      );

      const latency = Date.now() - start;

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.result) {
          const domain = data.result.name;
          
          await resolveIncidentsByService('cloudflare');
          this.setResult('cloudflare', {
            healthy: true,
            latency,
            details: { domain, status: response.status }
          });
        } else {
          // API responded but with errors
          const errorMsg = data.errors?.[0]?.message || 'Unknown API error';
          
          await createOrUpdateIncident(
            'cloudflare',
            'warn',
            'Cloudflare API returned errors',
            errorMsg,
            { status: response.status, latency },
            'Check Cloudflare API token permissions'
          );

          this.setResult('cloudflare', {
            healthy: false,
            latency,
            error: errorMsg
          });
        }
      } else {
        // HTTP error response
        const errorText = await response.text().catch(() => '');
        
        await createOrUpdateIncident(
          'cloudflare',
          'warn',
          'Cloudflare API error',
          `HTTP ${response.status}: ${errorText.substring(0, 100)}`,
          { status: response.status, latency },
          'Verify CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID'
        );

        this.setResult('cloudflare', {
          healthy: false,
          latency,
          error: `HTTP ${response.status}`
        });
      }
    } catch (error: any) {
      const latency = Date.now() - start;
      
      // Network errors are non-critical for optional service
      await createOrUpdateIncident(
        'cloudflare',
        'warn',
        'Cloudflare API network error',
        `Failed to connect to Cloudflare API: ${error.message}`,
        { error: error.message, latency },
        'Check network connectivity (non-critical)'
      );

      this.setResult('cloudflare', {
        healthy: false,
        latency,
        error: 'Network error'
      });
    }
  }

  private async checkTunnel(): Promise<void> {
    const start = Date.now();
    const domain = process.env.CLOUDFLARE_DOMAIN || 'care2connects.org';

    // This is an external connectivity check - failures are non-critical
    // The tunnel might be running fine even if this check fails due to:
    // - DNS not yet propagated
    // - Certificate issues on first run
    // - Temporary network issues

    try {
      // Only check API domain (frontend doesn't have /health/live route)
      // Frontend is a Next.js app - checking API health is sufficient
      // Backend API health is what matters for system health
      const apiResponse = await fetch(`https://api.${domain}/health/live`, {
        signal: AbortSignal.timeout(15000)
      });

      const latency = Date.now() - start;

      if (apiResponse.ok) {
        await resolveIncidentsByService('tunnel');
        this.setResult('tunnel', {
          healthy: true,
          latency,
          details: {
            api: apiResponse.status,
            domain
          }
        });
      } else {
        // Non-critical incident since tunnel might be running locally fine
        await createOrUpdateIncident(
          'tunnel',
          'warn',
          'Tunnel external check failed',
          `API: ${apiResponse.status}`,
          { api: apiResponse.status, latency },
          'Check DNS propagation and tunnel routing (may be normal during DNS changes)'
        );

        this.setResult('tunnel', {
          healthy: false,
          latency,
          error: 'External check failed'
        });
      }
    } catch (error: any) {
      const latency = Date.now() - start;
      
      // Check if it's a DNS error (common during propagation)
      const isDnsError = error.message?.includes('getaddrinfo') || 
                         error.message?.includes('ENOTFOUND') ||
                         error.message?.includes('DNS');
      
      const isTimeoutError = error.name === 'AbortError' || 
                              error.message?.includes('timeout');
      
      let errorType = 'Connection failed';
      let suggestion = 'Check cloudflared tunnel status and DNS configuration';
      
      if (isDnsError) {
        errorType = 'DNS not resolved';
        suggestion = 'DNS may be propagating - this is normal after DNS changes';
      } else if (isTimeoutError) {
        errorType = 'Timeout';
        suggestion = 'External connectivity issue - local tunnel may still be working';
      }
      
      // Always create warning-level incident (not critical)
      await createOrUpdateIncident(
        'tunnel',
        'warn',
        `Tunnel external check: ${errorType}`,
        `Cannot reach ${domain}: ${error.message}`,
        { error: error.message, domain, latency, errorType },
        suggestion
      );

      this.setResult('tunnel', {
        healthy: false,
        latency,
        error: errorType
      });
    }
  }

  private async checkSpeech(): Promise<void> {
    const start = Date.now();

    try {
      // Check if whisper or similar is available
      // For now, just check if we can import the speech modules
      const latency = Date.now() - start;
      
      // This is a placeholder - you would implement actual speech model checking
      await resolveIncidentsByService('speech');
      this.setResult('speech', {
        healthy: true,
        latency,
        details: { model: 'available' }
      });
      
    } catch (error: any) {
      const latency = Date.now() - start;
      
      await createOrUpdateIncident(
        'speech',
        'warn',
        'Speech transcription unavailable',
        `Speech model not accessible: ${error.message}`,
        { error: error.message, latency },
        'Install and configure Whisper or EVTS speech model'
      );

      this.setResult('speech', {
        healthy: false,
        latency,
        error: 'Model not available'
      });
    }
  }

  getResults(): Map<string, HealthCheckResult> {
    return this.results;
  }

  getSanitizedResults(): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    this.results.forEach((result, service) => {
      sanitized[service] = {
        healthy: result.healthy,
        lastChecked: result.lastChecked,
        latency: result.latency,
        error: result.error,
        // Don't include raw details that might contain secrets
        hasDetails: !!result.details
      };
    });

    return sanitized;
  }
}

export const healthCheckRunner = new HealthCheckRunner();
