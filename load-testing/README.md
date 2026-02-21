# Load Testing Configuration for CareConnect API

## Overview
Comprehensive load testing suite using k6 for performance validation, capacity planning, and system reliability testing across all critical CareConnect endpoints.

## 🚀 Setup & Installation

### Prerequisites
```bash
# Install k6
# Windows (using Chocolatey)
choco install k6

# macOS (using Homebrew)
brew install k6

# Ubuntu/Debian
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Configuration Files
```javascript
// load-testing/config/environments.js
export const environments = {
  local: {
    baseUrl: 'http://localhost:3001',
    webUrl: 'http://localhost:3000'
  },
  staging: {
    baseUrl: 'https://api-staging.careconnect.org',
    webUrl: 'https://staging.careconnect.org'
  },
  production: {
    baseUrl: 'https://api.careconnect.org',
    webUrl: 'https://careconnect.org'
  }
};

export const testConfig = {
  thresholds: {
    // Performance thresholds
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.01'],    // Error rate under 1%
    
    // Specific endpoint thresholds
    'http_req_duration{endpoint:health}': ['p(95)<500'],
    'http_req_duration{endpoint:search}': ['p(95)<3000'],
    'http_req_duration{endpoint:ai_chat}': ['p(95)<5000'],
    
    // Rate limiting validation
    'http_reqs': ['rate>10'],          // At least 10 req/s
  },
  
  scenarios: {
    baseline: {
      executor: 'ramping-vus',
      stages: [
        { duration: '2m', target: 10 },   // Ramp up
        { duration: '5m', target: 10 },   // Steady state
        { duration: '2m', target: 0 },    // Ramp down
      ],
    },
    
    stress: {
      executor: 'ramping-vus',
      stages: [
        { duration: '2m', target: 50 },   // Ramp up
        { duration: '5m', target: 50 },   // Stress level
        { duration: '2m', target: 100 },  // Peak stress
        { duration: '3m', target: 100 },  // Hold peak
        { duration: '2m', target: 0 },    // Ramp down
      ],
    },
    
    spike: {
      executor: 'ramping-vus',
      stages: [
        { duration: '10s', target: 100 }, // Spike up
        { duration: '1m', target: 100 },  // Hold spike
        { duration: '10s', target: 0 },   // Drop
      ],
    }
  }
};
```

## 📊 Base Load Testing Scenarios

### 1. Health Check & System Monitoring
```javascript
// load-testing/scenarios/health-check.js
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
  
  // Detailed health check (lower frequency)
  if (__ITER % 10 === 0) {
    response = http.get(`${baseUrl}/health/detailed`, {
      tags: { endpoint: 'health-detailed' }
    });
    
    check(response, {
      'detailed health status is 200': (r) => r.status === 200,
      'all services healthy': (r) => {
        const services = r.json('services') || {};
        return Object.values(services).every(service => 
          service.status === 'fulfilled' && service.value.healthy
        );
      },
    }) || errorRate.add(1);
  }
  
  sleep(1);
}
```

### 2. Authentication Flow Testing
```javascript
// load-testing/scenarios/auth-flow.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

const users = new SharedArray('users', function () {
  return JSON.parse(open('../data/test-users.json'));
});

export const options = {
  scenarios: {
    login_flow: {
      executor: 'per-vu-iterations',
      vus: 50,
      iterations: 1,
      maxDuration: '10m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const baseUrl = __ENV.API_URL || 'https://api.careconnect.org';
  const user = users[__VU % users.length];
  
  // User Registration (if test user)
  if (user.isTestUser) {
    const registerPayload = {
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    
    let response = http.post(`${baseUrl}/api/auth/register`, JSON.stringify(registerPayload), {
      headers: { 'Content-Type': 'application/json' },
      tags: { endpoint: 'register' }
    });
    
    check(response, {
      'registration successful': (r) => r.status === 201 || r.status === 409, // 409 if user exists
    });
  }
  
  // User Login
  const loginPayload = {
    email: user.email,
    password: user.password,
  };
  
  let response = http.post(`${baseUrl}/api/auth/login`, JSON.stringify(loginPayload), {
    headers: { 'Content-Type': 'application/json' },
    tags: { endpoint: 'login' }
  });
  
  const loginCheck = check(response, {
    'login successful': (r) => r.status === 200,
    'login returns token': (r) => r.json('token') !== undefined,
  });
  
  if (!loginCheck) {
    return; // Skip rest if login failed
  }
  
  const token = response.json('token');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  
  // Get user profile
  response = http.get(`${baseUrl}/api/auth/me`, { 
    headers,
    tags: { endpoint: 'profile' }
  });
  
  check(response, {
    'profile fetch successful': (r) => r.status === 200,
    'profile contains user data': (r) => r.json('user.email') === user.email,
  });
  
  // Update profile
  const updatePayload = {
    preferences: {
      notifications: true,
      language: 'en'
    }
  };
  
  response = http.put(`${baseUrl}/api/users/preferences`, JSON.stringify(updatePayload), {
    headers,
    tags: { endpoint: 'update-preferences' }
  });
  
  check(response, {
    'preferences update successful': (r) => r.status === 200,
  });
  
  sleep(1);
}
```

### 3. Job Search Performance Testing
```javascript
// load-testing/scenarios/job-search.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const searchLatency = new Trend('search_response_time');
const searchErrors = new Rate('search_errors');

const searchQueries = [
  'entry level',
  'customer service', 
  'warehouse',
  'food service',
  'retail',
  'security',
  'cleaning',
  'construction',
  'healthcare assistant',
  'delivery driver'
];

const locations = [
  'San Francisco, CA',
  'Los Angeles, CA',
  'New York, NY',
  'Chicago, IL',
  'Houston, TX',
  'Seattle, WA',
  'Denver, CO',
  'Atlanta, GA'
];

export const options = {
  scenarios: {
    job_search_load: {
      executor: 'ramping-vus',
      stages: [
        { duration: '2m', target: 30 },
        { duration: '5m', target: 30 },
        { duration: '2m', target: 60 },
        { duration: '3m', target: 60 },
        { duration: '2m', target: 0 },
      ],
    },
  },
  thresholds: {
    search_response_time: ['p(95)<5000'],
    search_errors: ['rate<0.02'],
    http_req_duration: ['p(95)<5000'],
  },
};

export default function () {
  const baseUrl = __ENV.API_URL || 'https://api.careconnect.org';
  
  // Login first to get auth token
  const loginPayload = {
    email: 'testuser@example.com',
    password: 'TestPass123!'
  };
  
  let response = http.post(`${baseUrl}/api/auth/login`, JSON.stringify(loginPayload), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (response.status !== 200) {
    searchErrors.add(1);
    return;
  }
  
  const token = response.json('token');
  const headers = { 'Authorization': `Bearer ${token}` };
  
  // Perform job search
  const query = searchQueries[Math.floor(Math.random() * searchQueries.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  
  const startTime = Date.now();
  response = http.get(`${baseUrl}/api/jobs/search?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`, {
    headers,
    tags: { endpoint: 'job-search' }
  });
  const endTime = Date.now();
  
  searchLatency.add(endTime - startTime);
  
  const searchCheck = check(response, {
    'job search successful': (r) => r.status === 200,
    'job search returns results': (r) => Array.isArray(r.json('jobs')),
    'job search response time acceptable': (r) => r.timings.duration < 10000,
  });
  
  if (!searchCheck) {
    searchErrors.add(1);
  }
  
  // Simulate user browsing job details (20% of the time)
  if (Math.random() < 0.2 && response.status === 200) {
    const jobs = response.json('jobs');
    if (jobs && jobs.length > 0) {
      const randomJob = jobs[Math.floor(Math.random() * jobs.length)];
      
      response = http.get(`${baseUrl}/api/jobs/${randomJob.id}`, {
        headers,
        tags: { endpoint: 'job-details' }
      });
      
      check(response, {
        'job details fetch successful': (r) => r.status === 200,
      });
    }
  }
  
  sleep(Math.random() * 3 + 1); // 1-4 second pause
}
```

### 4. AI Chat Concurrency Testing
```javascript
// load-testing/scenarios/ai-chat.js
import http from 'k6/http';
import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';

const chatErrors = new Rate('chat_errors');
const messagesProcessed = new Counter('messages_processed');

const chatMessages = [
  'I need help finding housing',
  'Where can I find food assistance?',
  'I need job search help',
  'Can you help me with healthcare services?',
  'I need legal aid assistance',
  'Where are emergency shelters?',
  'I need mental health support',
  'Help me apply for benefits',
  'I need transportation assistance',
  'Where can I get documents replaced?'
];

export const options = {
  scenarios: {
    ai_chat_rest: {
      executor: 'ramping-vus',
      stages: [
        { duration: '1m', target: 10 },
        { duration: '3m', target: 20 },
        { duration: '1m', target: 0 },
      ],
    },
    ai_chat_websocket: {
      executor: 'ramping-vus',
      stages: [
        { duration: '1m', target: 5 },
        { duration: '3m', target: 10 },
        { duration: '1m', target: 0 },
      ],
    },
  },
  thresholds: {
    chat_errors: ['rate<0.05'],
    http_req_duration: ['p(95)<10000'],
    ws_session_duration: ['p(95)<30000'],
  },
};

export default function () {
  const baseUrl = __ENV.API_URL || 'https://api.careconnect.org';
  const wsUrl = baseUrl.replace('https://', 'wss://').replace('http://', 'ws://');
  
  // Get auth token
  const loginPayload = {
    email: 'testuser@example.com',
    password: 'TestPass123!'
  };
  
  let response = http.post(`${baseUrl}/api/auth/login`, JSON.stringify(loginPayload), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (response.status !== 200) {
    chatErrors.add(1);
    return;
  }
  
  const token = response.json('token');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  
  if (__ITER % 2 === 0) {
    // REST API Chat Testing
    testRestChat(baseUrl, headers);
  } else {
    // WebSocket Chat Testing
    testWebSocketChat(wsUrl, token);
  }
}

function testRestChat(baseUrl, headers) {
  const message = chatMessages[Math.floor(Math.random() * chatMessages.length)];
  
  const chatPayload = {
    message: message,
    context: {
      userId: 'load-test-user',
      sessionId: `session-${__VU}-${__ITER}`
    }
  };
  
  const response = http.post(`${baseUrl}/api/ai/chat`, JSON.stringify(chatPayload), {
    headers,
    tags: { endpoint: 'ai-chat-rest' }
  });
  
  const chatCheck = check(response, {
    'AI chat successful': (r) => r.status === 200,
    'AI chat returns response': (r) => r.json('response') !== undefined,
    'AI chat response time acceptable': (r) => r.timings.duration < 15000,
  });
  
  if (chatCheck) {
    messagesProcessed.add(1);
  } else {
    chatErrors.add(1);
  }
  
  sleep(2);
}

function testWebSocketChat(wsUrl, token) {
  const sessionDuration = Math.random() * 20000 + 10000; // 10-30 seconds
  
  const res = ws.connect(`${wsUrl}/api/ai/chat/stream`, {
    headers: { Authorization: `Bearer ${token}` }
  }, function (socket) {
    
    socket.on('open', function () {
      // Send initial message
      const message = chatMessages[Math.floor(Math.random() * chatMessages.length)];
      socket.send(JSON.stringify({
        message: message,
        userId: `load-test-user-${__VU}`,
        sessionId: `ws-session-${__VU}-${__ITER}`
      }));
    });
    
    socket.on('message', function (message) {
      const data = JSON.parse(message);
      
      check(data, {
        'WebSocket message valid': (d) => d.message !== undefined,
      }) || chatErrors.add(1);
      
      messagesProcessed.add(1);
      
      // Send follow-up message (30% chance)
      if (Math.random() < 0.3) {
        const followUp = chatMessages[Math.floor(Math.random() * chatMessages.length)];
        socket.send(JSON.stringify({
          message: followUp,
          userId: `load-test-user-${__VU}`,
        }));
      }
    });
    
    socket.on('error', function (e) {
      console.error('WebSocket error:', e);
      chatErrors.add(1);
    });
    
    // Keep connection alive for session duration
    socket.setTimeout(function () {
      socket.close();
    }, sessionDuration);
  });
  
  check(res, {
    'WebSocket connection successful': (r) => r && r.status === 101,
  }) || chatErrors.add(1);
}
```

### 5. Audio Upload/Transcription Load Testing
```javascript
// load-testing/scenarios/audio-processing.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const uploadErrors = new Rate('upload_errors');
const transcriptionLatency = new Trend('transcription_time');

// Simulate different audio file sizes (in bytes)
const audioFileSizes = [
  50000,   // ~50KB - short clip
  100000,  // ~100KB - medium clip  
  200000,  // ~200KB - longer clip
  500000,  // ~500KB - extended clip
];

export const options = {
  scenarios: {
    audio_upload_load: {
      executor: 'ramping-vus',
      stages: [
        { duration: '1m', target: 5 },
        { duration: '3m', target: 10 },
        { duration: '2m', target: 15 },
        { duration: '2m', target: 0 },
      ],
    },
  },
  thresholds: {
    upload_errors: ['rate<0.1'],
    transcription_time: ['p(95)<30000'], // 30 seconds max
    http_req_duration: ['p(95)<30000'],
  },
};

export default function () {
  const baseUrl = __ENV.API_URL || 'https://api.careconnect.org';
  
  // Get auth token
  const loginPayload = {
    email: 'testuser@example.com',
    password: 'TestPass123!'
  };
  
  let response = http.post(`${baseUrl}/api/auth/login`, JSON.stringify(loginPayload), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (response.status !== 200) {
    uploadErrors.add(1);
    return;
  }
  
  const token = response.json('token');
  
  // Generate mock audio data
  const fileSize = audioFileSizes[Math.floor(Math.random() * audioFileSizes.length)];
  const audioData = generateMockAudioData(fileSize);
  
  // Upload audio for transcription
  const formData = {
    audio: http.file(audioData, 'test-audio.wav', 'audio/wav'),
    language: 'en-US',
    model: 'whisper-1'
  };
  
  const startTime = Date.now();
  response = http.post(`${baseUrl}/api/voice/transcribe`, formData, {
    headers: { 
      'Authorization': `Bearer ${token}`,
    },
    tags: { endpoint: 'audio-transcribe' }
  });
  const endTime = Date.now();
  
  transcriptionLatency.add(endTime - startTime);
  
  const uploadCheck = check(response, {
    'audio upload successful': (r) => r.status === 200,
    'transcription returned': (r) => r.json('transcription') !== undefined,
    'processing time reasonable': (r) => r.timings.duration < 45000,
  });
  
  if (!uploadCheck) {
    uploadErrors.add(1);
  }
  
  // Test voice query processing (if transcription succeeded)
  if (response.status === 200) {
    const transcription = response.json('transcription');
    
    const queryPayload = {
      query: transcription,
      audioProcessed: true,
      context: {
        userId: `load-test-${__VU}`,
        sessionType: 'voice'
      }
    };
    
    response = http.post(`${baseUrl}/api/voice/process-query`, JSON.stringify(queryPayload), {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      tags: { endpoint: 'voice-query' }
    });
    
    check(response, {
      'voice query processing successful': (r) => r.status === 200,
      'voice response generated': (r) => r.json('response') !== undefined,
    });
  }
  
  sleep(3); // Longer pause for audio processing
}

function generateMockAudioData(size) {
  // Generate mock WAV header + random audio data
  const header = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, // "RIFF"
    0x00, 0x00, 0x00, 0x00, // File size placeholder
    0x57, 0x41, 0x56, 0x45, // "WAVE"
    0x66, 0x6D, 0x74, 0x20, // "fmt "
    0x10, 0x00, 0x00, 0x00, // Chunk size
    0x01, 0x00,             // Audio format (PCM)
    0x01, 0x00,             // Channels (mono)
    0x44, 0xAC, 0x00, 0x00, // Sample rate (44100)
    0x88, 0x58, 0x01, 0x00, // Byte rate
    0x02, 0x00,             // Block align
    0x10, 0x00,             // Bits per sample
    0x64, 0x61, 0x74, 0x61, // "data"
    0x00, 0x00, 0x00, 0x00  // Data size placeholder
  ]);
  
  const audioData = new Uint8Array(size);
  
  // Fill with random audio-like data
  for (let i = 0; i < audioData.length; i++) {
    audioData[i] = Math.floor(Math.random() * 256);
  }
  
  return new Uint8Array([...header, ...audioData]);
}
```

## 🔥 Stress & Spike Testing

### High-Load Stress Test
```javascript
// load-testing/scenarios/stress-test.js
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

export const options = {
  scenarios: {
    stress_test: {
      executor: 'ramping-vus',
      stages: [
        { duration: '5m', target: 100 },  // Ramp up to 100 users
        { duration: '10m', target: 200 }, // Ramp to 200 users  
        { duration: '5m', target: 300 },  // Peak at 300 users
        { duration: '10m', target: 300 }, // Hold peak load
        { duration: '5m', target: 100 },  // Scale back down
        { duration: '5m', target: 0 },    // Cool down
      ],
    },
  },
  thresholds: {
    http_req_duration: [
      'p(95)<5000',   // 95% of requests under 5s
      'p(99)<10000',  // 99% of requests under 10s
    ],
    http_req_failed: ['rate<0.1'], // Less than 10% failure rate
    http_reqs: ['rate>50'],         // At least 50 req/s sustained
  },
};

export default function () {
  // Mix of all endpoint types under stress
  const testScenarios = [
    () => testPublicEndpoints(),
    () => testAuthenticatedEndpoints(), 
    () => testSearchEndpoints(),
    () => testAIEndpoints(),
  ];
  
  const scenario = testScenarios[Math.floor(Math.random() * testScenarios.length)];
  scenario();
}

export function handleSummary(data) {
  return {
    'stress-test-report.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
```

### Spike Testing
```javascript
// load-testing/scenarios/spike-test.js
export const options = {
  scenarios: {
    spike_test: {
      executor: 'ramping-vus',
      stages: [
        { duration: '2m', target: 10 },   // Normal load
        { duration: '30s', target: 500 }, // Sudden spike
        { duration: '1m', target: 500 },  // Hold spike
        { duration: '30s', target: 10 },  // Drop back  
        { duration: '2m', target: 10 },   // Recover
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<10000'], // More lenient during spike
    http_req_failed: ['rate<0.2'],      // Allow higher failure rate
  },
};
```

## 📈 Performance Testing Execution Scripts

### Test Runner Script
```bash
#!/bin/bash
# load-testing/scripts/run-tests.sh

set -e

# Configuration
API_URL=${API_URL:-"https://api.careconnect.org"}
RESULTS_DIR="results/$(date +%Y%m%d_%H%M%S)"

mkdir -p "$RESULTS_DIR"

echo "🚀 Starting CareConnect Load Testing Suite"
echo "API URL: $API_URL"
echo "Results Directory: $RESULTS_DIR"

# Run test scenarios
echo "1. Running Health Check Load Test..."
k6 run --env API_URL="$API_URL" \
       --out json="$RESULTS_DIR/health-check.json" \
       scenarios/health-check.js

echo "2. Running Authentication Flow Test..."  
k6 run --env API_URL="$API_URL" \
       --out json="$RESULTS_DIR/auth-flow.json" \
       scenarios/auth-flow.js

echo "3. Running Job Search Performance Test..."
k6 run --env API_URL="$API_URL" \
       --out json="$RESULTS_DIR/job-search.json" \
       scenarios/job-search.js

echo "4. Running AI Chat Concurrency Test..."
k6 run --env API_URL="$API_URL" \
       --out json="$RESULTS_DIR/ai-chat.json" \
       scenarios/ai-chat.js

echo "5. Running Audio Processing Load Test..."
k6 run --env API_URL="$API_URL" \
       --out json="$RESULTS_DIR/audio-processing.json" \
       scenarios/audio-processing.js

echo "6. Running Stress Test..."
k6 run --env API_URL="$API_URL" \
       --out json="$RESULTS_DIR/stress-test.json" \
       scenarios/stress-test.js

echo "7. Running Spike Test..."
k6 run --env API_URL="$API_URL" \
       --out json="$RESULTS_DIR/spike-test.json" \
       scenarios/spike-test.js

echo "✅ All load tests completed!"
echo "Results saved to: $RESULTS_DIR"

# Generate combined report
node scripts/generate-report.js "$RESULTS_DIR"
```

### Test Data Setup
```json
// load-testing/data/test-users.json
[
  {
    "email": "testuser1@example.com",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User1",
    "isTestUser": true
  },
  {
    "email": "testuser2@example.com", 
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User2",
    "isTestUser": true
  },
  {
    "email": "caseworker@example.com",
    "password": "CaseWorker123!",
    "firstName": "Case",
    "lastName": "Worker",
    "role": "case_worker",
    "isTestUser": true
  }
]
```

This comprehensive load testing suite validates system performance under various load conditions and ensures the CareConnect API can handle production traffic volumes efficiently.