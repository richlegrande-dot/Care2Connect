import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: 20 },
    { duration: '3m', target: 20 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    errors: ['rate<0.1'],
    http_req_duration: ['p(95)<1000'],
  },
};

export default function () {
  const baseUrl = __ENV.API_URL || 'https://api.careconnect.org';
  
  // Basic health check
  let response = http.get(`${baseUrl}/health`, {
    tags: { endpoint: 'health' }
  });
  
  check(response, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 500ms': (r) => r.timings.duration < 500,
    'health check returns status': (r) => r.json('status') === 'healthy',
  }) || errorRate.add(1);
  
  sleep(1);
}