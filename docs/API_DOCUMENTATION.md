# CareConnect API Documentation

## Overview

The CareConnect API provides RESTful endpoints for managing user profiles, audio transcription, job search, resource finding, donations, and AI chat assistance.

**Base URL**: `http://localhost:3001/api` (development)
**Production URL**: `https://api.careconnect.app` (when deployed)

## Authentication

CareConnect supports anonymous users by default. Users can optionally register with an email for enhanced features.

### Create Anonymous User
```http
POST /api/auth/anonymous
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "clr1x2y3z4a5b6c7d8e9f0g1",
    "anonymous": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

## Audio Transcription

### Upload and Transcribe Audio
```http
POST /api/transcribe
Content-Type: multipart/form-data

Form Data:
- audio: [audio file]
- userId: [optional user ID]
```

**Response:**
```json
{
  "success": true,
  "data": {
    "audioFileId": "clr1x2y3z4a5b6c7d8e9f0g1",
    "transcript": "Hi, my name is John and I'm looking for work...",
    "profileData": {
      "name": "John",
      "age": 35,
      "skills": ["construction", "painting"],
      "job_history": {...},
      "urgent_needs": ["housing", "employment"],
      "long_term_goals": ["stable housing", "full-time job"],
      "summary": "Experienced construction worker seeking stable employment...",
      "donation_pitch": "Help John get back on his feet with stable housing and work opportunities.",
      "tags": ["construction", "experienced", "motivated"]
    }
  }
}
```

### Get Transcription Status
```http
GET /api/transcribe/{audioFileId}/status
```

## Profile Management

### Create Profile
```http
POST /api/profile
Content-Type: application/json

{
  "userId": "clr1x2y3z4a5b6c7d8e9f0g1",
  "transcript": "Hi, my name is John...",
  "profileData": {
    "name": "John",
    "skills": ["construction"],
    "summary": "..."
  },
  "consentGiven": true,
  "isProfilePublic": false
}
```

### Get Public Profile
```http
GET /api/profile/{profileId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "clr1x2y3z4a5b6c7d8e9f0g1",
      "name": "John",
      "bio": "Experienced construction worker...",
      "skills": ["construction", "painting"],
      "urgentNeeds": ["housing", "employment"],
      "longTermGoals": ["stable housing"],
      "donationPitch": "Help John get back on his feet...",
      "cashtag": "$johndoe123",
      "qrCodeUrl": "/qr-codes/cashapp-johndoe123.png",
      "viewCount": 15,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "user": {
      "location": "San Francisco, CA",
      "memberSince": "2024-01-15T10:30:00Z"
    }
  }
}
```

### Update Profile
```http
PUT /api/profile/{profileId}
Content-Type: application/json

{
  "bio": "Updated bio...",
  "skills": ["construction", "painting", "carpentry"],
  "cashtag": "$johndoe123",
  "isProfilePublic": true
}
```

### Search Profiles
```http
GET /api/profile?query=construction&location=san+francisco&page=1&limit=10
```

## Chat Assistant

### Send Message
```http
POST /api/chat
Content-Type: application/json

{
  "userId": "clr1x2y3z4a5b6c7d8e9f0g1",
  "message": "I need help finding a job in construction"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "I'd be happy to help you find construction jobs! Based on your profile, I can see you have experience in construction and painting. Let me search for relevant opportunities in your area...",
    "followUpQuestions": [
      "What type of construction work are you most interested in?",
      "Do you have any certifications or licenses?",
      "Would you like help creating a cover letter?"
    ],
    "messageId": "clr1x2y3z4a5b6c7d8e9f0g1",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Get Conversation History
```http
GET /api/chat/{userId}/history?page=1&limit=20
```

### Get Conversation Starters
```http
GET /api/chat/{userId}/starters
```

**Response:**
```json
{
  "success": true,
  "data": {
    "starters": [
      "I see you have skills in construction and painting. Would you like help finding job opportunities in these areas?",
      "You mentioned wanting stable housing. What's the first step you'd like to take toward this goal?",
      "Would you like help setting up ways for people to donate and support you?"
    ]
  }
}
```

## Job Search

### Search Jobs
```http
GET /api/jobs/search?keywords=construction&location=san+francisco&limit=10&userId=clr1x2y3z4a5b6c7d8e9f0g1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job123",
        "title": "Construction Worker",
        "company": "BuildCorp",
        "location": "San Francisco, CA",
        "description": "Looking for experienced construction worker...",
        "salary": "$25-30/hour",
        "type": "full-time",
        "url": "https://example.com/job/123",
        "postedDate": "2 days ago",
        "requirements": ["2+ years experience", "Physical fitness"],
        "source": "Indeed",
        "matchScore": 8,
        "insights": ["Your construction experience is a great match", "Highlight your painting skills"]
      }
    ],
    "totalResults": 25
  }
}
```

### Get Job Recommendations
```http
GET /api/jobs/recommendations/{userId}
```

### Generate Cover Letter
```http
POST /api/jobs/cover-letter/{userId}
Content-Type: application/json

{
  "jobTitle": "Construction Worker",
  "company": "BuildCorp",
  "jobDescription": "Looking for experienced construction worker..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "coverLetter": "Dear Hiring Manager,\n\nI am writing to express my interest in the Construction Worker position at BuildCorp...",
    "jobDetails": {
      "title": "Construction Worker",
      "company": "BuildCorp"
    },
    "profile": {
      "name": "John",
      "skills": ["construction", "painting"]
    }
  }
}
```

## Resource Finder

### Search Resources
```http
GET /api/resources/search?zipCode=94102&category=SHELTER&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "resources": [
      {
        "id": "res123",
        "name": "City Homeless Shelter",
        "description": "Emergency shelter providing temporary housing...",
        "category": "SHELTER",
        "address": "123 Main Street",
        "city": "San Francisco",
        "state": "CA",
        "zipCode": "94102",
        "phone": "(555) 123-4567",
        "website": "https://example-shelter.org",
        "hours": {
          "monday": "24/7",
          "tuesday": "24/7"
        },
        "services": ["Emergency shelter", "Meals", "Case management"],
        "eligibility": "Adults 18+, families with children",
        "verified": true,
        "source": "Local Database"
      }
    ],
    "totalResults": 8
  }
}
```

### Get Resource Recommendations
```http
GET /api/resources/recommendations/{userId}
```

### Get Resource Categories
```http
GET /api/resources/categories
```

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "category": "SHELTER",
        "count": 25,
        "description": "Emergency housing and temporary shelter services"
      },
      {
        "category": "FOOD",
        "count": 18,
        "description": "Food assistance, food banks, and meal programs"
      },
      {
        "category": "HEALTHCARE",
        "count": 12,
        "description": "Medical care, mental health, and health services"
      }
    ]
  }
}
```

### Search Resources by Needs
```http
POST /api/resources/search-by-needs
Content-Type: application/json

{
  "needs": ["housing", "food", "healthcare"],
  "location": "94102"
}
```

## Donations

### Generate Cash App QR Code
```http
POST /api/donations/cashapp/qr
Content-Type: application/json

{
  "cashtag": "johndoe123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cashtag": "$johndoe123",
    "qrCodeUrl": "/qr-codes/cashapp-johndoe123-1234567890.png",
    "cashAppUrl": "https://cash.app/$johndoe123"
  }
}
```

### Generate GoFundMe Story
```http
GET /api/donations/gofundme/{profileId}/story
```

**Response:**
```json
{
  "success": true,
  "data": {
    "story": "**Help John Get Back on His Feet**\n\nJohn is an experienced construction worker who has fallen on hard times...\n\n**How Your Donation Helps:**\n- Provides temporary housing stability\n- Supports job search efforts\n- Covers basic necessities\n\n**John's Goals:**\n- Secure stable housing\n- Find full-time employment\n- Rebuild his life\n\nEvery contribution, no matter the size, brings John closer to stability and independence. Thank you for your support.\n\n*Share this campaign to help John's story reach more people who can help.*",
    "profileData": {
      "name": "John",
      "skills": ["construction", "painting"]
    }
  }
}
```

### Validate Donation Information
```http
POST /api/donations/validate
Content-Type: application/json

{
  "cashtag": "johndoe123",
  "gofundmeUrl": "https://gofundme.com/f/help-john"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cashtag": {
      "valid": true,
      "formatted": "$johndoe123"
    },
    "gofundmeUrl": {
      "valid": true
    }
  }
}
```

### Track Donation (Analytics Only)
```http
POST /api/donations/track
Content-Type: application/json

{
  "userId": "clr1x2y3z4a5b6c7d8e9f0g1",
  "platform": "cashapp",
  "amount": 25.00,
  "donorEmail": "donor@example.com",
  "message": "Hope this helps!"
}
```

### Generate Social Media Appeal
```http
GET /api/donations/social/{profileId}?platform=twitter
```

**Response:**
```json
{
  "success": true,
  "data": {
    "appeal": "Meet John, an experienced construction worker working to get back on his feet. Your support can help him secure housing and find stable employment. Every contribution makes a difference! 🙏 #CareConnect #Community #Support",
    "platform": "twitter",
    "profileUrl": "/profile/clr1x2y3z4a5b6c7d8e9f0g1"
  }
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error
- `503` - Service Unavailable

### Example Error Response
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Valid email required"
    }
  ]
}
```

## Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **Audio Upload**: 5 uploads per hour per IP
- **Chat Messages**: 30 messages per minute per user

## Data Privacy

- All sensitive data is encrypted at rest
- Users can delete their data at any time
- Anonymous mode available for complete privacy
- GDPR and privacy law compliant

## SDK Examples

### JavaScript/TypeScript
```typescript
const api = new CareConnectAPI('http://localhost:3001/api');

// Create anonymous user
const user = await api.auth.createAnonymous();

// Upload audio and create profile
const formData = new FormData();
formData.append('audio', audioBlob);
formData.append('userId', user.userId);

const transcription = await api.transcribe.upload(formData);
const profile = await api.profile.create({
  userId: user.userId,
  transcript: transcription.transcript,
  profileData: transcription.profileData,
  consentGiven: true
});

// Get job recommendations
const jobs = await api.jobs.getRecommendations(user.userId);

// Chat with assistant
const response = await api.chat.sendMessage(user.userId, "Help me find a job");
```

For more examples and detailed integration guides, see the [Developer Guide](./DEVELOPER_GUIDE.md).