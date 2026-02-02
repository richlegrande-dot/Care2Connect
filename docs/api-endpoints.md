# CareConnect API Endpoints Documentation

## Authentication & User Management

### Authentication Endpoints
```typescript
// Authentication routes
POST   /api/auth/register              // User registration
POST   /api/auth/login                 // User login
POST   /api/auth/logout                // User logout
POST   /api/auth/refresh               // Refresh JWT token
POST   /api/auth/forgot-password       // Password reset request
POST   /api/auth/reset-password        // Password reset confirmation
POST   /api/auth/verify-email          // Email verification
POST   /api/auth/resend-verification   // Resend verification email
POST   /api/auth/change-password       // Change password (authenticated)
GET    /api/auth/me                    // Get current user info
PUT    /api/auth/me                    // Update current user info
```

### User Profile Management
```typescript
// User profile routes
GET    /api/users/profile              // Get user profile
PUT    /api/users/profile              // Update user profile
POST   /api/users/profile/avatar       // Upload profile avatar
DELETE /api/users/profile/avatar       // Delete profile avatar
GET    /api/users/preferences          // Get user preferences
PUT    /api/users/preferences          // Update user preferences
GET    /api/users/dashboard            // Get user dashboard data
POST   /api/users/deactivate           // Deactivate user account
POST   /api/users/reactivate           // Reactivate user account
```

### Role & Permission Management
```typescript
// Admin user management
GET    /api/admin/users                // List all users (admin)
GET    /api/admin/users/:id            // Get specific user (admin)
PUT    /api/admin/users/:id            // Update user (admin)
DELETE /api/admin/users/:id            // Delete user (admin)
POST   /api/admin/users/:id/roles      // Assign roles (admin)
DELETE /api/admin/users/:id/roles      // Remove roles (admin)
GET    /api/admin/roles                // List all roles (admin)
POST   /api/admin/roles                // Create new role (admin)
PUT    /api/admin/roles/:id            // Update role (admin)
DELETE /api/admin/roles/:id            // Delete role (admin)
```

## Housing & Shelter Management

### Shelter Information
```typescript
// Shelter and housing routes
GET    /api/shelters                   // List all shelters
GET    /api/shelters/:id               // Get specific shelter details
POST   /api/shelters                   // Create new shelter (admin)
PUT    /api/shelters/:id               // Update shelter (admin)
DELETE /api/shelters/:id               // Delete shelter (admin)
GET    /api/shelters/search            // Search shelters by location/criteria
GET    /api/shelters/nearby            // Get nearby shelters (geolocation)
POST   /api/shelters/:id/availability  // Update bed availability
GET    /api/shelters/:id/reviews       // Get shelter reviews
POST   /api/shelters/:id/reviews       // Add shelter review
```

### Housing Resources
```typescript
// Housing assistance routes
GET    /api/housing/resources          // List housing resources
GET    /api/housing/assistance         // Housing assistance programs
GET    /api/housing/applications       // User's housing applications
POST   /api/housing/applications       // Submit housing application
PUT    /api/housing/applications/:id   // Update application
DELETE /api/housing/applications/:id   // Cancel application
GET    /api/housing/waitlist           // Get waitlist status
POST   /api/housing/waitlist           // Join waitlist
DELETE /api/housing/waitlist/:id       // Leave waitlist
```

### Emergency Housing
```typescript
// Emergency housing routes
GET    /api/emergency/shelters         // Available emergency shelters
POST   /api/emergency/request          // Request emergency housing
GET    /api/emergency/status           // Check emergency request status
PUT    /api/emergency/status/:id       // Update emergency request
POST   /api/emergency/checkin          // Check into emergency shelter
POST   /api/emergency/checkout         // Check out of emergency shelter
```

## Job Search & Employment

### Job Search Integration
```typescript
// Job search routes
GET    /api/jobs/search                // Search jobs (Indeed/Adzuna API)
GET    /api/jobs/:id                   // Get specific job details
POST   /api/jobs/save                  // Save job to favorites
DELETE /api/jobs/save/:id              // Remove from favorites
GET    /api/jobs/saved                 // Get saved jobs
GET    /api/jobs/applied               // Get applied jobs history
POST   /api/jobs/apply                 // Record job application
PUT    /api/jobs/apply/:id             // Update application status
```

### Employment Services
```typescript
// Employment assistance routes
GET    /api/employment/services        // List employment services
GET    /api/employment/training        // Job training programs
POST   /api/employment/training/enroll // Enroll in training program
GET    /api/employment/workshops       // Employment workshops
POST   /api/employment/workshops/register // Register for workshop
GET    /api/employment/counseling      // Employment counseling services
POST   /api/employment/counseling/book // Book counseling session
```

### Resume & Profile Management
```typescript
// Career development routes
GET    /api/career/resume              // Get user's resume
PUT    /api/career/resume              // Update resume
POST   /api/career/resume/upload       // Upload resume file
GET    /api/career/skills              // Get user's skills
POST   /api/career/skills              // Add new skill
PUT    /api/career/skills/:id          // Update skill
DELETE /api/career/skills/:id          // Remove skill
GET    /api/career/experience          // Get work experience
POST   /api/career/experience          // Add work experience
PUT    /api/career/experience/:id      // Update experience
DELETE /api/career/experience/:id      // Remove experience
```

## Healthcare & Mental Health

### Healthcare Services
```typescript
// Healthcare routes
GET    /api/healthcare/providers       // List healthcare providers
GET    /api/healthcare/providers/:id   // Get provider details
GET    /api/healthcare/services        // Healthcare services available
POST   /api/healthcare/appointments    // Schedule appointment
GET    /api/healthcare/appointments    // Get user appointments
PUT    /api/healthcare/appointments/:id // Update appointment
DELETE /api/healthcare/appointments/:id // Cancel appointment
```

### Mental Health Resources
```typescript
// Mental health routes
GET    /api/mental-health/resources    // Mental health resources
GET    /api/mental-health/counselors   // List counselors/therapists
POST   /api/mental-health/sessions     // Schedule counseling session
GET    /api/mental-health/sessions     // Get scheduled sessions
GET    /api/mental-health/crisis       // Crisis intervention resources
POST   /api/mental-health/crisis/contact // Contact crisis hotline
GET    /api/mental-health/support-groups // Support group information
POST   /api/mental-health/support-groups/join // Join support group
```

### Health Records Management
```typescript
// Health records routes
GET    /api/health/records             // Get health records
POST   /api/health/records             // Add health record
PUT    /api/health/records/:id         // Update health record
DELETE /api/health/records/:id         // Delete health record
GET    /api/health/medications         // Get medications list
POST   /api/health/medications         // Add medication
PUT    /api/health/medications/:id     // Update medication
DELETE /api/health/medications/:id     // Remove medication
```

## Food & Nutrition Services

### Food Resources
```typescript
// Food assistance routes
GET    /api/food/pantries              // List food pantries
GET    /api/food/pantries/:id          // Get pantry details
GET    /api/food/pantries/nearby       // Get nearby food pantries
GET    /api/food/kitchens              // List soup kitchens
GET    /api/food/kitchens/:id          // Get kitchen details
GET    /api/food/kitchens/schedule     // Get meal schedules
```

### SNAP & Benefits
```typescript
// Food benefits routes
GET    /api/benefits/snap              // SNAP benefits information
POST   /api/benefits/snap/apply        // Apply for SNAP benefits
GET    /api/benefits/snap/status       // Check SNAP application status
GET    /api/benefits/wic               // WIC program information
POST   /api/benefits/wic/apply         // Apply for WIC benefits
GET    /api/benefits/food-stamps       // Food stamp information
```

### Nutrition Programs
```typescript
// Nutrition assistance routes
GET    /api/nutrition/programs         // Nutrition education programs
POST   /api/nutrition/programs/enroll  // Enroll in nutrition program
GET    /api/nutrition/meal-planning    // Meal planning resources
POST   /api/nutrition/meal-plans       // Create meal plan
GET    /api/nutrition/dietary          // Dietary assistance
POST   /api/nutrition/consultation     // Schedule nutrition consultation
```

## Legal & Document Services

### Legal Aid
```typescript
// Legal assistance routes
GET    /api/legal/services             // Legal aid services
GET    /api/legal/attorneys            // List legal aid attorneys
POST   /api/legal/consultation         // Request legal consultation
GET    /api/legal/consultation/:id     // Get consultation details
GET    /api/legal/documents            // Legal document templates
POST   /api/legal/documents/generate   // Generate legal document
```

### Document Management
```typescript
// Document services routes
GET    /api/documents                  // Get user documents
POST   /api/documents/upload           // Upload document
GET    /api/documents/:id              // Get specific document
PUT    /api/documents/:id              // Update document
DELETE /api/documents/:id              // Delete document
POST   /api/documents/verify           // Verify document authenticity
GET    /api/documents/templates        // Document templates
POST   /api/documents/request-help     // Request document assistance
```

### ID & Vital Records
```typescript
// ID and vital records routes
GET    /api/documents/id-requirements  // ID requirements information
POST   /api/documents/id/request       // Request ID assistance
GET    /api/documents/birth-certificate // Birth certificate help
GET    /api/documents/social-security  // Social Security card help
GET    /api/documents/drivers-license  // Driver's license assistance
POST   /api/documents/replacement      // Request document replacement
```

## Voice & AI Integration

### Voice Processing
```typescript
// Voice and AI routes
POST   /api/voice/transcribe           // Transcribe audio (Whisper API)
POST   /api/voice/process-query        // Process voice query
GET    /api/voice/history              // Get voice interaction history
POST   /api/voice/feedback             // Submit voice feedback
GET    /api/voice/settings             // Get voice settings
PUT    /api/voice/settings             // Update voice settings
```

### AI Chat & Support
```typescript
// AI assistance routes
POST   /api/ai/chat                    // Chat with AI assistant (GPT-4)
GET    /api/ai/chat/history            // Get chat history
POST   /api/ai/recommendations         // Get AI recommendations
POST   /api/ai/analyze-needs           // Analyze user needs with AI
GET    /api/ai/supported-languages     // Get supported languages
POST   /api/ai/translate               // Translate content
```

### Smart Matching
```typescript
// AI matching routes
POST   /api/ai/match-services          // Match user to services
POST   /api/ai/match-housing           // Match user to housing
POST   /api/ai/match-jobs              // Match user to jobs
GET    /api/ai/match-history           // Get matching history
POST   /api/ai/improve-matching        // Improve matching with feedback
```

## Transportation & Mobility

### Transportation Services
```typescript
// Transportation routes
GET    /api/transportation/services    // Transportation services
GET    /api/transportation/routes      // Public transit routes
GET    /api/transportation/passes      // Transit pass information
POST   /api/transportation/assistance  // Request transportation help
GET    /api/transportation/rideshare   // Rideshare programs
POST   /api/transportation/rideshare/request // Request rideshare
```

### Vehicle Services
```typescript
// Vehicle assistance routes
GET    /api/vehicles/assistance        // Vehicle assistance programs
POST   /ai/vehicles/donation-request   // Request vehicle donation
GET    /api/vehicles/insurance         // Vehicle insurance help
GET    /api/vehicles/registration      // Vehicle registration assistance
GET    /api/vehicles/repairs           // Vehicle repair resources
```

## Financial Services

### Financial Assistance
```typescript
// Financial aid routes
GET    /api/financial/assistance       // Financial assistance programs
POST   /api/financial/assistance/apply // Apply for financial aid
GET    /api/financial/emergency        // Emergency financial help
POST   /api/financial/emergency/request // Request emergency funds
GET    /api/financial/budgeting        // Budgeting resources
POST   /api/financial/budget/create    // Create budget plan
```

### Banking & Credit
```typescript
// Banking services routes
GET    /api/banking/services           // Banking services for homeless
GET    /api/banking/accounts           // Bank account assistance
POST   /api/banking/account/open       // Help open bank account
GET    /api/credit/reports             // Credit report assistance
GET    /api/credit/repair              // Credit repair resources
POST   /api/credit/counseling          // Request credit counseling
```

## Education & Training

### Educational Resources
```typescript
// Education routes
GET    /api/education/programs         // Educational programs
GET    /api/education/ged              // GED preparation resources
POST   /api/education/ged/enroll       // Enroll in GED program
GET    /api/education/literacy         // Adult literacy programs
GET    /api/education/vocational       // Vocational training programs
POST   /api/education/vocational/apply // Apply for vocational training
```

### Skills Development
```typescript
// Skills training routes
GET    /api/skills/programs            // Skills training programs
GET    /api/skills/certifications     // Available certifications
POST   /api/skills/certifications/enroll // Enroll in certification
GET    /api/skills/digital             // Digital literacy programs
GET    /api/skills/life                // Life skills training
POST   /api/skills/assessment          // Skills assessment
```

## Community & Support

### Community Resources
```typescript
// Community routes
GET    /api/community/groups           // Community support groups
POST   /api/community/groups/join      // Join support group
GET    /api/community/events           // Community events
POST   /api/community/events/attend    // RSVP to event
GET    /api/community/volunteers       // Volunteer opportunities
POST   /api/community/volunteers/signup // Sign up to volunteer
```

### Peer Support
```typescript
// Peer support routes
GET    /api/peer-support/mentors       // Available mentors
POST   /api/peer-support/mentors/request // Request mentor
GET    /api/peer-support/groups        // Peer support groups
POST   /api/peer-support/groups/create // Create support group
GET    /api/peer-support/resources     // Peer support resources
```

## Emergency Services

### Crisis Intervention
```typescript
// Emergency routes
GET    /api/emergency/services         // Emergency services
POST   /api/emergency/contact          // Contact emergency services
GET    /api/emergency/hotlines         // Crisis hotlines
POST   /api/emergency/alert            // Send emergency alert
GET    /api/emergency/shelters         // Emergency shelter availability
POST   /api/emergency/assistance       // Request emergency assistance
```

### Safety Resources
```typescript
// Safety routes
GET    /api/safety/resources           // Safety resources
GET    /api/safety/locations           // Safe locations/shelters
POST   /api/safety/report              // Report safety concern
GET    /api/safety/domestic-violence   // Domestic violence resources
GET    /api/safety/weather             // Weather alerts and resources
```

## Data & Analytics

### User Analytics
```typescript
// Analytics routes (admin)
GET    /api/analytics/users            // User analytics
GET    /api/analytics/services         // Service usage analytics
GET    /api/analytics/outcomes         // Outcome tracking
GET    /api/analytics/demographics     // Demographics data
GET    /api/analytics/reports          // Generate reports
```

### System Monitoring
```typescript
// System routes
GET    /api/system/health              // System health check
GET    /api/system/status              // System status
GET    /api/system/metrics             // System metrics
GET    /api/system/logs                // System logs (admin)
POST   /api/system/feedback            // Submit system feedback
```

## Integration & Webhooks

### External API Integration
```typescript
// Integration routes
GET    /api/integrations/status        // Integration status
POST   /api/integrations/sync          // Sync external data
GET    /api/integrations/findhelp      // FindHelp.org integration
GET    /api/integrations/indeed        // Indeed API integration
GET    /api/integrations/adzuna        // Adzuna API integration
```

### Webhook Management
```typescript
// Webhook routes
GET    /api/webhooks                   // List webhooks
POST   /api/webhooks                   // Create webhook
PUT    /api/webhooks/:id               // Update webhook
DELETE /api/webhooks/:id               // Delete webhook
POST   /api/webhooks/test              // Test webhook
GET    /api/webhooks/logs              // Webhook logs
```

## File & Media Management

### File Operations
```typescript
// File management routes
GET    /api/files                      // List user files
POST   /api/files/upload               // Upload file
GET    /api/files/:id                  // Get file
PUT    /api/files/:id                  // Update file metadata
DELETE /api/files/:id                  // Delete file
POST   /api/files/share                // Share file
GET    /api/files/shared               // Get shared files
```

### Media Processing
```typescript
// Media routes
POST   /api/media/audio/upload         // Upload audio file
POST   /api/media/audio/process        // Process audio
POST   /api/media/image/upload         // Upload image
POST   /api/media/image/process        // Process/resize image
GET    /api/media/thumbnails/:id       // Get thumbnail
```

This comprehensive API documentation covers all major endpoints across the CareConnect system, organized by functional areas to support the complete homeless assistance platform.