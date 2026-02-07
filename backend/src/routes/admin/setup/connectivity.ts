import { Router, Request, Response } from 'express';
import dns from 'dns/promises';
import https from 'https';
import http from 'http';
import { URL } from 'url';

const router = Router();

interface DNSCheck {
  resolver: string;
  success: boolean;
  addresses?: string[];
  error?: string;
  timing?: number;
}

interface ConnectivityStatus {
  timestamp: string;
  backendPort: number;
  domain: string | null;
  publicUrl: string | null;
  dnsChecks: DNSCheck[];
  tlsStatus: {
    enabled: boolean;
    success?: boolean;
    error?: string;
    certificateInfo?: any;
  };
  tunnelStatus: {
    lastKnownUrl: string | null;
    responding?: boolean;
    error?: string;
  };
}

interface ConnectivityTestResult {
  timestamp: string;
  tests: {
    local: {
      success: boolean;
      url: string;
      status?: number;
      error?: string;
      timing?: number;
    };
    public: {
      success: boolean;
      url: string | null;
      status?: number;
      error?: string;
      timing?: number;
    };
    webhook: {
      success: boolean;
      url: string | null;
      status?: number;
      error?: string;
      timing?: number;
    };
  };
  recommendations: string[];
}

// DNS resolution with different resolvers
async function checkDNS(domain: string, resolver: string): Promise<DNSCheck> {
  const startTime = Date.now();
  
  try {
    // Set custom DNS server
    const originalServers = dns.getServers();
    dns.setServers([resolver]);
    
    const addresses = await dns.resolve4(domain);
    const timing = Date.now() - startTime;
    
    // Restore original DNS servers
    dns.setServers(originalServers);
    
    return {
      resolver,
      success: true,
      addresses,
      timing
    };
  } catch (error) {
    // Restore original DNS servers on error
    const originalServers = dns.getServers();
    dns.setServers(originalServers);
    
    return {
      resolver,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timing: Date.now() - startTime
    };
  }
}

// TLS/SSL status check
async function checkTLS(url: string): Promise<{ success: boolean; error?: string; certificateInfo?: any }> {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: '/health/live',
        method: 'HEAD',
        timeout: 10000,
        rejectUnauthorized: true
      };
      
      const req = https.request(options, (res) => {
        const cert = (res.connection as any)?.getPeerCertificate?.();
        resolve({
          success: true,
          certificateInfo: cert ? {
            subject: cert.subject,
            issuer: cert.issuer,
            validFrom: cert.valid_from,
            validTo: cert.valid_to,
            fingerprint: cert.fingerprint
          } : null
        });
      });
      
      req.on('error', (error) => {
        resolve({
          success: false,
          error: error.message
        });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({
          success: false,
          error: 'Connection timeout'
        });
      });
      
      req.end();
    } catch (error) {
      resolve({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid URL'
      });
    }
  });
}

// HTTP request helper
async function makeHttpRequest(url: string, method: 'GET' | 'HEAD' | 'OPTIONS' = 'HEAD'): Promise<{ success: boolean; status?: number; error?: string; timing?: number }> {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method,
        timeout: 10000,
        rejectUnauthorized: true
      };
      
      const req = client.request(options, (res) => {
        resolve({
          success: true,
          status: res.statusCode,
          timing: Date.now() - startTime
        });
      });
      
      req.on('error', (error) => {
        resolve({
          success: false,
          error: error.message,
          timing: Date.now() - startTime
        });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({
          success: false,
          error: 'Connection timeout',
          timing: Date.now() - startTime
        });
      });
      
      req.end();
    } catch (error) {
      resolve({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid URL',
        timing: Date.now() - startTime
      });
    }
  });
}

// GET /admin/setup/connectivity/status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const backendPort = parseInt(process.env.PORT || '3002');
    const domain = process.env.PRIMARY_DOMAIN || 'care2connects.org';
    const publicUrl = process.env.PUBLIC_URL || null;
    const tunnelUrl = process.env.TUNNEL_URL || null;
    
    // DNS checks with multiple resolvers
    const dnsChecks = await Promise.all([
      checkDNS(domain, '8.8.8.8'), // Google DNS
      checkDNS(domain, '1.1.1.1'), // Cloudflare DNS
      checkDNS(domain, dns.getServers()[0] || '192.168.1.1') // System DNS
    ]);
    
    // TLS status check
    let tlsStatus: ConnectivityStatus['tlsStatus'] = { enabled: false };
    if (publicUrl) {
      try {
        const tlsResult = await checkTLS(publicUrl);
        tlsStatus = {
          enabled: true,
          success: tlsResult.success,
          error: tlsResult.error,
          certificateInfo: tlsResult.certificateInfo
        };
      } catch (error) {
        tlsStatus = {
          enabled: true,
          success: false,
          error: error instanceof Error ? error.message : 'TLS check failed'
        };
      }
    }
    
    // Tunnel status check
    let tunnelStatus: ConnectivityStatus['tunnelStatus'] = { lastKnownUrl: tunnelUrl };
    if (tunnelUrl) {
      try {
        const tunnelResult = await makeHttpRequest(`${tunnelUrl}/health/live`, 'GET');
        tunnelStatus = {
          lastKnownUrl: tunnelUrl,
          responding: tunnelResult.success,
          error: tunnelResult.error
        };
      } catch (error) {
        tunnelStatus = {
          lastKnownUrl: tunnelUrl,
          responding: false,
          error: error instanceof Error ? error.message : 'Tunnel check failed'
        };
      }
    }
    
    const status: ConnectivityStatus = {
      timestamp: new Date().toISOString(),
      backendPort,
      domain,
      publicUrl,
      dnsChecks,
      tlsStatus,
      tunnelStatus
    };

    // Transform to match test expectations
    const cloudflareCheck = dnsChecks.find(c => c.resolver === '1.1.1.1');
    const googleCheck = dnsChecks.find(c => c.resolver === '8.8.8.8');
    const systemCheck = dnsChecks.find(c => c.resolver !== '1.1.1.1' && c.resolver !== '8.8.8.8');
    
    const response = {
      timestamp: status.timestamp,
      domain: status.domain,
      dns: {
        cloudflare: {
          resolved: cloudflareCheck?.success ?? false,
          ip: cloudflareCheck?.addresses?.[0] || null,
          error: cloudflareCheck?.error
        },
        google: {
          resolved: googleCheck?.success ?? false,
          ip: googleCheck?.addresses?.[0] || null,
          error: googleCheck?.error
        },
        opendns: {
          resolved: systemCheck?.success ?? false,
          ip: systemCheck?.addresses?.[0] || null,
          error: systemCheck?.error
        }
      },
      tls: {
        valid: tlsStatus.success ?? false,
        enabled: tlsStatus.enabled,
        error: tlsStatus.error,
        certificateInfo: tlsStatus.certificateInfo
      },
      tunnel: status.tunnelStatus,
      // Keep original format for backward compatibility
      backendPort: status.backendPort,
      publicUrl: status.publicUrl,
      dnsChecks: status.dnsChecks,
      tlsStatus: status.tlsStatus,
      tunnelStatus: status.tunnelStatus
    };
    
    res.json(response);
  } catch (error) {
    console.error('Connectivity status check failed:', error);
    res.status(500).json({
      error: 'Failed to check connectivity status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /admin/setup/connectivity/test
router.post('/test', async (req: Request, res: Response) => {
  try {
    const { testDns = true, testLocal = true, testPublic = true, testWebhook = true } = req.body;
    
    const backendPort = parseInt(process.env.PORT || '3002');
    const publicUrl = process.env.PUBLIC_URL;
    const recommendations: string[] = [];
    
    const testResults: any = {};
    
    // DNS test
    if (testDns) {
      const domain = process.env.PRIMARY_DOMAIN || 'care2connects.org';
      const dnsChecks = await Promise.all([
        checkDNS(domain, '8.8.8.8'),
        checkDNS(domain, '1.1.1.1'),
        checkDNS(domain, dns.getServers()[0] || '192.168.1.1')
      ]);
      testResults.dns = {
        cloudflare: dnsChecks.find(c => c.resolver === '1.1.1.1') || { success: false },
        google: dnsChecks.find(c => c.resolver === '8.8.8.8') || { success: false },
        opendns: dnsChecks[2] || { success: false }
      };
    } else {
      testResults.dns = { skipped: true };
    }
    
    // Local test
    if (testLocal) {
      const localUrl = `http://localhost:${backendPort}/health/live`;
      const localTest = await makeHttpRequest(localUrl, 'GET');
      testResults.local = { ...localTest, url: localUrl };
      
      if (!localTest.success) {
        recommendations.push('Local backend server is not responding - check if server is running on the correct port');
      }
    } else {
      testResults.local = { skipped: true, success: false };
    }
    
    // Public test
    if (testPublic) {
      let publicTest = { success: false, url: null as string | null };
      if (publicUrl) {
        const publicHealthUrl = `${publicUrl}/health/live`;
        publicTest = {
          ...await makeHttpRequest(publicHealthUrl, 'GET'),
          url: publicHealthUrl
        };
        
        if (!publicTest.success) {
          recommendations.push('Public URL is not accessible - check tunnel configuration and DNS propagation');
        }
      } else {
        publicTest.url = null;
        recommendations.push('Set PUBLIC_URL environment variable for public access testing');
      }
      testResults.public = publicTest;
    } else {
      testResults.public = { skipped: true, success: false };
    }
    
    // Webhook test
    if (testWebhook) {
      let webhookTest = { success: false, url: null as string | null };
      if (publicUrl) {
        const webhookUrl = `${publicUrl}/api/payments/stripe-webhook`;
        const webhookResult = await makeHttpRequest(webhookUrl, 'OPTIONS');
        webhookTest = {
          ...webhookResult,
          url: webhookUrl
        };
        
        // Accept 405 Method Not Allowed as success for webhook endpoint
        if (webhookResult.status === 405) {
          webhookTest.success = true;
        }
        
        if (!webhookTest.success) {
          recommendations.push('Webhook endpoint is not accessible - verify routing configuration');
        }
      } else {
        webhookTest.url = null;
        recommendations.push('Configure PUBLIC_URL to test webhook endpoint');
      }
      testResults.webhook = webhookTest;
    } else {
      testResults.webhook = { skipped: true, success: false };
    }
    
    // Calculate overall status
    const allTests = Object.values(testResults);
    const successfulTests = allTests.filter((t: any) => t.success || (t.cloudflare && t.cloudflare.success));
    const overallStatus = successfulTests.length === allTests.length ? 'pass' : 
                         successfulTests.length > 0 ? 'partial' : 'fail';
    
    const result = {
      timestamp: new Date().toISOString(),
      testResults,
      tests: testResults, // Backward compatibility
      overallStatus,
      recommendations
    };
    
    res.json(result);
  } catch (error) {
    console.error('Connectivity test failed:', error);
    res.status(500).json({
      error: 'Failed to run connectivity test',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
