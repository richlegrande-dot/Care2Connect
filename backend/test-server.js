import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (for QR codes)
app.use('/qr-codes', express.static(path.join(process.cwd(), 'public/qr-codes')));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'CareConnect Backend API',
    version: '1.0.0'
  });
});

// API Routes
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'CareConnect API is running!',
    features: [
      'Audio Story Collection',
      'AI Profile Generation', 
      'Real-Time Shelter Search',
      'Aid Eligibility Screening',
      'QR Code Donation Generation',
      'GoFundMe Draft Creation',
      'Job Search & Matching',
      'Resource Discovery',
      'Crisis Chat Assistant'
    ],
    endpoints: {
      health: '/health',
      api: '/api/*',
      qrCodes: '/qr-codes/*'
    }
  });
});

// Donation endpoints (simplified for testing)
app.post('/api/donations/cashapp/qr', (req, res) => {
  const { cashtag } = req.body;
  
  if (!cashtag) {
    return res.status(400).json({ 
      success: false, 
      error: 'Cashtag is required' 
    });
  }

  // Simulate QR code generation
  const cleanCashtag = cashtag.startsWith('$') ? cashtag : `$${cashtag}`;
  const qrUrl = `/qr-codes/cashapp-${cleanCashtag.replace('$', '')}-${Date.now()}.png`;
  
  res.json({
    success: true,
    qrCodeUrl: qrUrl,
    cashAppUrl: `https://cash.app/${cleanCashtag}`,
    message: 'QR code generated successfully'
  });
});

app.get('/api/donations/gofundme/:profileId/story', (req, res) => {
  const { profileId } = req.params;
  
  // Simulate GoFundMe story generation
  const story = {
    title: "Help Support My Journey to Stability",
    content: "Every person deserves a chance to rebuild their life with dignity. Your support can make a real difference in helping someone transition from homelessness to stability. Together, we can create positive change in our community.",
    goal: "$2,500",
    category: "Emergency",
    socialShare: "Join me in supporting someone in need. Every contribution helps! #CareConnect #Community #Support"
  };
  
  res.json({
    success: true,
    story,
    disclaimer: "This is a draft campaign. Manual verification required before publishing.",
    profileId
  });
});

// Shelter search endpoint (simplified)
app.get('/api/shelters/search', (req, res) => {
  const { lat, lng, populationType, hasAvailableBeds } = req.query;
  
  // Mock shelter data for testing
  const shelters = [
    {
      id: 'shelter-001',
      name: 'Downtown Emergency Shelter',
      address: {
        street: '123 Main St',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90012'
      },
      availability: {
        total: 15,
        men: 8,
        women: 5,
        families: 2
      },
      services: {
        meals: true,
        showers: true,
        medical: false,
        petFriendly: false
      },
      distance: lat && lng ? 2.3 : null,
      ranking: {
        score: 85,
        availabilityMatch: true,
        reasoning: ['Available beds', 'Close proximity', 'Basic amenities']
      }
    },
    {
      id: 'shelter-002', 
      name: 'Family Resource Center',
      address: {
        street: '456 Hope Ave',
        city: 'Los Angeles', 
        state: 'CA',
        zipCode: '90015'
      },
      availability: {
        total: 8,
        families: 6,
        women: 2
      },
      services: {
        meals: true,
        showers: true,
        childcare: true,
        medical: true,
        petFriendly: true
      },
      distance: lat && lng ? 4.1 : null,
      ranking: {
        score: 92,
        availabilityMatch: true,
        reasoning: ['Family-focused', 'Comprehensive services', 'Pet-friendly']
      }
    }
  ];

  res.json({
    success: true,
    shelters: shelters.filter(s => !hasAvailableBeds || s.availability.total > 0),
    summary: {
      totalFound: shelters.length,
      withAvailability: shelters.filter(s => s.availability.total > 0).length,
      averageDistance: lat && lng ? 3.2 : null
    }
  });
});

// Eligibility assessment endpoint (simplified)
app.post('/api/eligibility/assess', (req, res) => {
  const assessment = req.body;
  
  // Mock eligibility results
  const results = {
    overallScore: 78,
    likelyEligiblePrograms: ['SNAP', 'Medicaid', 'Emergency Housing'],
    requiresMoreInfo: ['TANF', 'WIC'],
    notEligiblePrograms: ['HUD Section 8'],
    nextSteps: [
      'Apply for SNAP benefits at local office',
      'Schedule Medicaid enrollment appointment', 
      'Contact emergency housing coordinator',
      'Gather required documentation'
    ],
    aiGuidance: {
      summary: 'Based on your situation, you appear eligible for several assistance programs that can provide immediate support.',
      urgentActions: ['Apply for emergency food assistance', 'Secure temporary shelter'],
      localResources: [
        {
          name: 'LA Food Bank',
          phone: '(323) 234-3030',
          description: 'Emergency food assistance'
        }
      ]
    }
  };
  
  res.json({
    success: true,
    assessment: results
  });
});

// Chat endpoint (simplified)
app.post('/api/chat', (req, res) => {
  const { message, userId } = req.body;
  
  // Mock AI response
  const responses = {
    'help': "I'm here to help you find the resources you need. I can assist with shelter information, job opportunities, benefits eligibility, and crisis support. What would you like help with today?",
    'shelter': "I can help you find available shelter beds in your area. Do you need emergency shelter tonight? Are you looking for family accommodation or individual beds?",
    'food': "There are several food assistance options available. I can help you find local food banks, apply for SNAP benefits, or locate meal programs. What type of food assistance do you need?",
    'job': "I can help you search for jobs, create a resume, or practice interview skills. What kind of work are you interested in or qualified for?",
    'crisis': "I understand you may be going through a difficult time. If this is an emergency, please call 911. For crisis support, you can reach the National Suicide Prevention Lifeline at 988. How can I support you right now?"
  };
  
  const keyword = Object.keys(responses).find(key => 
    message.toLowerCase().includes(key)
  );
  
  const response = keyword ? responses[keyword] : 
    "I understand you're reaching out for help. I can assist with shelter, food, jobs, benefits, and crisis support. Could you tell me more about what you need assistance with?";
  
  res.json({
    success: true,
    response: {
      message: response,
      timestamp: new Date().toISOString(),
      conversationId: userId || 'anonymous'
    }
  });
});

// Job search endpoint (simplified)
app.get('/api/jobs/search', (req, res) => {
  const { keywords, location } = req.query;
  
  // Mock job data
  const jobs = [
    {
      id: 'job-001',
      title: 'Customer Service Representative',
      company: 'Local Business Inc.',
      location: 'Los Angeles, CA',
      salary: '$15-18/hour',
      type: 'Full-time',
      description: 'Entry-level customer service position with training provided.',
      requirements: ['High school diploma', 'Good communication skills'],
      posted: '2 days ago'
    },
    {
      id: 'job-002',
      title: 'Warehouse Associate',
      company: 'Logistics Corp', 
      location: 'Los Angeles, CA',
      salary: '$16-20/hour',
      type: 'Full-time',
      description: 'Physical warehouse work with opportunities for advancement.',
      requirements: ['Ability to lift 50lbs', 'Reliable transportation'],
      posted: '1 day ago'
    }
  ];
  
  res.json({
    success: true,
    jobs,
    totalResults: jobs.length
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found',
    availableRoutes: ['/health', '/api/test', '/api/donations/*', '/api/shelters/*', '/api/eligibility/*', '/api/chat', '/api/jobs/*']
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 CareConnect Backend Server Running!
📍 Port: ${PORT}
🌐 Environment: ${process.env.NODE_ENV || 'development'}
🔗 Health Check: http://localhost:${PORT}/health
📡 API Test: http://localhost:${PORT}/api/test

✅ Available Services:
   - QR Code Generation: POST /api/donations/cashapp/qr
   - GoFundMe Drafts: GET /api/donations/gofundme/:id/story
   - Shelter Search: GET /api/shelters/search
   - Eligibility Assessment: POST /api/eligibility/assess
   - AI Chat: POST /api/chat
   - Job Search: GET /api/jobs/search

🎯 Ready for validation testing!
  `);
});

export default app;