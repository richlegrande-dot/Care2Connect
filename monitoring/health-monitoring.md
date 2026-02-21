# Health Check and Monitoring Configuration

## Health Check Endpoints

### Basic Health Check
```typescript
// backend/src/routes/health.ts
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Basic health check
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check external API availability (sample)
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      database: 'connected',
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        free: process.memoryUsage().heapTotal - process.memoryUsage().heapUsed
      },
      checks: {
        database: await checkDatabase(),
        openai: await checkOpenAI(),
        storage: await checkStorage(),
        cache: await checkCache()
      }
    };
    
    res.status(200).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Detailed health check for internal monitoring
router.get('/health/detailed', async (req: Request, res: Response) => {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkOpenAI(),
    checkStorage(),
    checkCache(),
    checkExternalAPIs()
  ]);
  
  const healthData = {
    status: checks.every(check => check.status === 'fulfilled' && check.value.healthy) ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      database: checks[0],
      openai: checks[1],
      storage: checks[2],
      cache: checks[3],
      externalAPIs: checks[4]
    },
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version
    }
  };
  
  res.status(200).json(healthData);
});

export default router;
```

## Service Health Checks

### Database Health Check
```typescript
async function checkDatabase() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - start;
    
    return {
      healthy: true,
      responseTime,
      status: 'connected'
    };
  } catch (error) {
    return {
      healthy: false,
      status: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

### OpenAI API Health Check
```typescript
async function checkOpenAI() {
  try {
    const start = Date.now();
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const responseTime = Date.now() - start;
    
    return {
      healthy: response.ok,
      responseTime,
      status: response.status,
      rateLimitRemaining: response.headers.get('x-ratelimit-remaining')
    };
  } catch (error) {
    return {
      healthy: false,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

### Storage Health Check
```typescript
async function checkStorage() {
  try {
    const start = Date.now();
    
    // Check Supabase Storage
    const response = await fetch(`${process.env.SUPABASE_URL}/storage/v1/bucket`, {
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_ANON_KEY
      }
    });
    
    const responseTime = Date.now() - start;
    
    return {
      healthy: response.ok,
      responseTime,
      status: 'connected',
      buckets: response.ok ? await response.json() : null
    };
  } catch (error) {
    return {
      healthy: false,
      status: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

## Monitoring and Logging

### Winston Logger Configuration
```typescript
// backend/src/config/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'careconnect-api',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console logging
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // File logging
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 50 * 1024 * 1024, // 50MB
      maxFiles: 5
    }),
    
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 50 * 1024 * 1024, // 50MB
      maxFiles: 10
    })
  ]
});

// Add HTTP request logging middleware
export const httpLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/access.log',
      maxsize: 50 * 1024 * 1024, // 50MB
      maxFiles: 10
    })
  ]
});

export default logger;
```

### Prometheus Metrics
```typescript
// backend/src/middleware/metrics.ts
import client from 'prom-client';

export const register = new client.Registry();

// Default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

export const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

export const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

export const databaseQueryDuration = new client.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Database query duration in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2]
});

export const openaiApiCalls = new client.Counter({
  name: 'openai_api_calls_total',
  help: 'Total number of OpenAI API calls',
  labelNames: ['model', 'status']
});

// Register metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeConnections);
register.registerMetric(databaseQueryDuration);
register.registerMetric(openaiApiCalls);

// Metrics middleware
export const metricsMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestDuration.observe(
      { method: req.method, route, status: res.statusCode },
      duration
    );
    
    httpRequestTotal.inc({
      method: req.method,
      route,
      status: res.statusCode
    });
  });
  
  next();
};
```

## Error Tracking and Alerting

### Error Handling Middleware
```typescript
// backend/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  // Determine error response
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';
  
  // Send error response
  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.path,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

## Performance Monitoring

### APM Configuration (New Relic example)
```typescript
// backend/src/config/apm.ts
import newrelic from 'newrelic';

// Custom metrics
export const trackCustomMetric = (name: string, value: number) => {
  newrelic.recordMetric(`Custom/${name}`, value);
};

export const trackTransaction = (name: string, callback: () => Promise<any>) => {
  return newrelic.startWebTransaction(name, callback);
};

// Database query tracking
export const trackDatabaseQuery = (query: string, duration: number) => {
  newrelic.recordMetric('Database/Query/Duration', duration);
  newrelic.addCustomAttribute('db.query', query);
};
```

### Grafana Dashboard Configuration
```yaml
# monitoring/grafana/dashboards/careconnect.json
{
  "dashboard": {
    "title": "CareConnect API Monitoring",
    "panels": [
      {
        "title": "HTTP Requests per Second",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Response Time Distribution",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Database Query Performance",
        "targets": [
          {
            "expr": "rate(database_query_duration_seconds_sum[5m]) / rate(database_query_duration_seconds_count[5m])",
            "legendFormat": "Average query time"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m])",
            "legendFormat": "5xx errors"
          }
        ]
      }
    ]
  }
}
```

## Uptime Monitoring

### External Monitoring Services
```yaml
# monitoring/uptime-robot.yml
monitors:
  - name: "CareConnect API Health"
    url: "https://api.careconnect.org/health"
    type: "HTTP"
    interval: 60
    timeout: 30
    expected_status: 200
    
  - name: "CareConnect Frontend"
    url: "https://careconnect.org"
    type: "HTTP"
    interval: 60
    timeout: 30
    expected_status: 200
    
  - name: "Database Connection"
    url: "https://api.careconnect.org/health/detailed"
    type: "HTTP"
    interval: 300
    timeout: 60
    expected_content: '"database":{"healthy":true}'

alerts:
  - type: "email"
    recipients: ["devops@careconnect.org"]
  - type: "slack"
    webhook: "${SLACK_WEBHOOK_URL}"
  - type: "pagerduty"
    integration_key: "${PAGERDUTY_KEY}"
```

### Health Check Automation
```bash
#!/bin/bash
# scripts/health-check.sh

API_URL="${API_URL:-https://api.careconnect.org}"
SLACK_WEBHOOK="${SLACK_WEBHOOK_URL}"

check_health() {
    local service_name=$1
    local endpoint=$2
    local expected_status=$3
    
    response=$(curl -s -w "%{http_code}" -o /tmp/health_response "$endpoint")
    status_code="${response: -3}"
    
    if [ "$status_code" != "$expected_status" ]; then
        echo "❌ $service_name health check failed (Status: $status_code)"
        send_alert "$service_name health check failed" "Status code: $status_code"
        return 1
    else
        echo "✅ $service_name is healthy"
        return 0
    fi
}

send_alert() {
    local title=$1
    local message=$2
    
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 CareConnect Alert: $title\n$message\"}" \
            "$SLACK_WEBHOOK"
    fi
}

# Run health checks
check_health "API" "$API_URL/health" "200"
check_health "Frontend" "https://careconnect.org" "200"
```