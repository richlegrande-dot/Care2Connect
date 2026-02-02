import { metricsCollector } from '../src/monitoring/metricsCollector';

console.log('metricsCollector.trackRequest:', metricsCollector.trackRequest);
console.log('typeof metricsCollector.trackRequest:', typeof metricsCollector.trackRequest);

// Test calling trackRequest
const middleware = metricsCollector.trackRequest();
console.log('middleware result:', middleware);
console.log('typeof middleware result:', typeof middleware);

describe('Debug metricsCollector', () => {
  it('should return a function from trackRequest', () => {
    expect(metricsCollector).toBeDefined();
    expect(typeof metricsCollector.trackRequest).toBe('function');
    
    const middleware = metricsCollector.trackRequest();
    expect(typeof middleware).toBe('function');
  });
});