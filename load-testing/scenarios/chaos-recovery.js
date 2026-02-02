import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';

const recoveryRate = new Rate('recovery_success');
const failureCount = new Counter('chaos_failures');

export const options = {
  scenarios: {
    chaos_monkey: {
      executor: 'constant-vus',
      vus: 10,
      duration: '10m',
    },
  },
  thresholds: {
    recovery_success: ['rate>0.8'], // 80% recovery success rate
    chaos_failures: ['count<50'],   // Less than 50 total failures
  },
};

const endpoints = [
  '/health',
  '/api/shelters',
  '/api/food/pantries',
  '/api/emergency/services'
];

export default function () {
  const baseUrl = __ENV.API_URL || 'https://api.careconnect.org';
  
  for (const endpoint of endpoints) {
    const response = http.get(`${baseUrl}${endpoint}`, {
      timeout: '30s',
      tags: { endpoint: endpoint }
    });
    
    if (response.status === 0 || response.status >= 500) {
      failureCount.add(1);
      
      // Test recovery - retry after brief wait
      sleep(2);
      const retryResponse = http.get(`${baseUrl}${endpoint}`, {
        timeout: '30s'
      });
      
      if (retryResponse.status === 200) {
        recoveryRate.add(1);
        console.log(`✅ Recovered from failure on ${endpoint}`);
      } else {
        recoveryRate.add(0);
        console.log(`❌ Failed to recover ${endpoint}`);
      }
    } else {
      check(response, {
        'endpoint healthy': (r) => r.status === 200,
      });
    }
  }
  
  sleep(5);
}