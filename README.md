# CareConnect System

## 🏠 Full-Stack Web Application for Supporting Homeless Individuals

CareConnect is a comprehensive platform that assists individuals experiencing homelessness by capturing their stories, generating public profiles, enabling donation support, and offering AI-powered resources, job discovery, and ongoing chat support.

## 📋 Table of Contents
- [System Architecture](#system-architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation Guide](#installation-guide)
- [API Documentation](#api-documentation)
- [Frontend Components](#frontend-components)
- [Security & Privacy](#security--privacy)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (Express)     │◄──►│ (PostgreSQL)    │
│                 │    │                 │    │                 │
│ - React Pages   │    │ - REST API      │    │ - User Data     │
│ - Components    │    │ - AI Services   │    │ - Profiles      │
│ - Audio Recording│   │ - File Upload   │    │ - Messages      │
│ - State Mgmt    │    │ - Job Search    │    │ - Resources     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  External APIs  │
                    │                 │
                    │ - OpenAI        │
                    │ - Indeed/Adzuna │
                    │ - FindHelp.org  │
                    └─────────────────┘
```

## ✨ Features

### 🎤 Core Features

1. **Audio Story Recording**
   - Browser-based microphone recording
   - Real-time audio visualization
   - Pause/resume functionality
   - Playback and re-recording options

2. **AI-Powered Transcription & Profile Generation**
   - OpenAI Whisper for speech-to-text
   - GPT-4 for extracting structured data
   - Automatic profile creation
   - Enhanced donation pitch generation

3. **Public Profile Pages**
   - Unique shareable URLs
   - Story summaries and bios
   - Skills and goals display
   - QR codes for donations
   - View counters

4. **Donation Infrastructure**
   - Cash App integration with QR codes
   - GoFundMe story generation
   - Donation tracking (analytics only)
   - Social media appeal generation

5. **AI Chat Assistant**
   - Contextual responses based on user profile
   - Employment guidance
   - Resource navigation
   - Form assistance
   - Life coaching support

6. **Job Search Integration**
   - Indeed/Adzuna API integration
   - Personalized job recommendations
   - Cover letter generation
   - Skill-based matching
   - Application tracking

7. **Local Resources Finder**
   - FindHelp.org integration
   - Category-based resource search
   - Personalized recommendations
   - Verified resource database
   - Distance-based results

### 🔒 Security & Privacy Features

- **Data Encryption**: Sensitive fields encrypted at rest
- **Consent Management**: Explicit consent for data usage
- **Privacy Controls**: Public/private profile settings
- **Data Retention**: Automatic cleanup of old data
- **Anonymous Mode**: Full anonymity options
- **Audit Logging**: Security event tracking

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **Language**: TypeScript
- **State Management**: React Query
- **Icons**: Heroicons
- **Notifications**: React Hot Toast
- **Audio**: MediaRecorder API

### Backend  
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **AI Services**: OpenAI API
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting

### External APIs
- **Speech-to-Text**: OpenAI Whisper
- **AI Processing**: OpenAI GPT-4
- **Job Search**: Indeed API, Adzuna API
- **Resources**: FindHelp.org API
- **QR Codes**: qrcode library

## 📦 Installation Guide

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- OpenAI API key

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd Care2system
```

### Step 2: Install Dependencies
```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

### Step 3: Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
```

### Step 4: Database Setup
```bash
# Navigate to backend
cd backend

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# (Optional) Open Prisma Studio
npm run db:studio
```

### Step 5: Development Server
```bash
# From root directory - runs both frontend and backend
npm run dev

# Or run individually:
npm run dev:frontend  # Frontend on :3000
npm run dev:backend   # Backend on :3001
```

## 🔧 Environment Variables

### Required Variables
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/careconnect"

# OpenAI API
OPENAI_API_KEY="your_openai_api_key_here"

# Application URLs
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:3001"

# Security
JWT_SECRET="your_jwt_secret_key_here"
ENCRYPTION_KEY="your_32_character_encryption_key_here"
```

### Optional Variables
```env
# Job Search APIs
INDEED_API_KEY="your_indeed_api_key"
ADZUNA_API_ID="your_adzuna_api_id"
ADZUNA_API_KEY="your_adzuna_api_key"

# Local Resources
FINDHELP_API_KEY="your_findhelp_api_key"

# Supabase (Optional Authentication)
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"

# File Storage (Optional)
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
AWS_BUCKET_NAME="careconnect-audio-files"
```

## 📡 API Documentation

### Authentication Endpoints
```
POST /api/auth/anonymous          # Create anonymous user
POST /api/auth/register           # Register user with email
POST /api/auth/update-consent     # Update consent settings
GET  /api/auth/user/:userId       # Get user information
```

### Transcription Endpoints
```
POST /api/transcribe              # Upload and transcribe audio
GET  /api/transcribe/:id/status   # Get transcription status
POST /api/transcribe/:id/reprocess # Reprocess transcript
```

### Profile Endpoints
```
POST /api/profile                 # Create profile
GET  /api/profile/:profileId      # Get public profile
PUT  /api/profile/:profileId      # Update profile
DELETE /api/profile/:profileId    # Delete profile
GET  /api/profile                 # Search profiles
```

### Chat Assistant Endpoints
```
POST /api/chat                    # Send message to AI
GET  /api/chat/:userId/history    # Get conversation history
GET  /api/chat/:userId/starters   # Get conversation starters
DELETE /api/chat/:userId          # Clear conversation
```

### Job Search Endpoints
```
GET  /api/jobs/search             # Search jobs
GET  /api/jobs/recommendations/:userId # Get job recommendations
POST /api/jobs/cover-letter/:userId   # Generate cover letter
GET  /api/jobs/suggestions/:userId    # Get search suggestions
```

### Resource Finder Endpoints
```
GET  /api/resources/search        # Search local resources
GET  /api/resources/recommendations/:userId # Get resource recommendations
GET  /api/resources/categories    # Get resource categories
POST /api/resources               # Add new resource
```

### Donation Endpoints
```
POST /api/donations/cashapp/qr    # Generate Cash App QR code
GET  /api/donations/gofundme/:profileId/story # Generate GoFundMe story
POST /api/donations/validate      # Validate donation info
POST /api/donations/track         # Track donation (analytics)
```

## 🎨 Frontend Components

### Key Pages
- `/` - Landing page with hero section
- `/tell-story` - Audio recording interface
- `/profile/[id]` - Public profile display
- `/dashboard` - User dashboard
- `/assistant/[id]` - Chat interface
- `/jobs/[id]` - Job recommendations
- `/resources/[id]` - Resource finder

### Reusable Components
- `AudioRecorder` - Voice recording component
- `ChatInterface` - AI assistant chat
- `ProfileCard` - Profile display component
- `JobCard` - Job listing component
- `ResourceCard` - Resource display component
- `QRCodeDisplay` - QR code generator
- `ConsentForm` - Privacy consent component

## 🔒 Security & Privacy

### Data Protection
- **Encryption at Rest**: Sensitive fields encrypted using AES-256-GCM
- **Data Minimization**: Only collect necessary information
- **Consent-Based**: Explicit consent for all data usage
- **Right to Deletion**: Users can delete their data anytime
- **Data Retention**: Automatic cleanup of old data

### Security Measures
- **Rate Limiting**: API request throttling
- **Input Sanitization**: XSS and injection prevention
- **Security Headers**: CSRF, clickjacking protection
- **Audit Logging**: Security event tracking
- **Content Security Policy**: Script execution controls

### Privacy Features
- **Anonymous Mode**: Complete anonymity option
- **Profile Visibility**: Public/private controls
- **Data Portability**: Export user data
- **Minimal Logging**: Privacy-aware logging
- **Secure File Handling**: Safe audio file processing

## 🚀 Deployment

**🛡️ PRODUCTION HARDENING**: This system implements production invariants to prevent deployment failures. See [PRODUCTION_INVARIANTS_DOCUMENTATION.md](PRODUCTION_INVARIANTS_DOCUMENTATION.md) for details.

### ✅ Pre-Deployment Validation (MANDATORY)

Before any deployment, ensure all production invariants are satisfied:

```powershell
# 1. Run critical path regression tests (MUST PASS)
.\scripts\critical-path-regression-tests.ps1 -StrictMode

# 2. Validate configuration consistency 
.\scripts\validate-config-consistency.ps1

# 3. Verify production readiness
curl https://api.care2connects.org/ops/health/production
```

**DEPLOYMENT BLOCKED** if any critical tests fail. See [PRODUCTION_DEPLOYMENT_CHECKLIST.md](PRODUCTION_DEPLOYMENT_CHECKLIST.md) for complete checklist.

### Frontend (Vercel)
```bash
# Validate startup configuration
npm run validate-startup

# Build for production
npm run build

# Run regression tests before deployment
npm run test:regression:demo

# Vercel deployment (only after validation passes)
vercel --prod
```

### Backend (Render/Fly.io)
```bash
# Build for production with validation
npm run build

# Verify production readiness contract
curl http://localhost:3001/ops/health/production

# Docker deployment (example)
docker build -t careconnect-backend .
docker push your-registry/careconnect-backend
```

### Production Environment Requirements

**Critical Environment Variables** (enforced by production invariants):
- `V1_STABLE=true` - Enables production hardening mode
- `ZERO_OPENAI_MODE=true` - Prevents OpenAI dependency
- `NODE_ENV=production` - Production mode
- `STRICT_PORT_MODE=true` - Prevents port drift

### Cloudflare Tunnel Configuration
```powershell
# IPv4 forcing (REQUIRED to prevent Windows networking issues)
cloudflared tunnel --edge-ip-version 4 run your-tunnel

# Automated tunnel startup with health verification
.\scripts\tunnel-start.ps1
```

### Database (PostgreSQL)
- Use managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)
- Set up connection pooling
- Configure backups and monitoring

### Post-Deployment Verification
```powershell
# Verify all production invariants after deployment
.\scripts\critical-path-regression-tests.ps1 -DemoMode

# Monitor production health
curl https://api.care2connects.org/ops/health/production

# Run complete deployment checklist  
# See: PRODUCTION_DEPLOYMENT_CHECKLIST.md
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open Pull Request

### Code Standards
- Use TypeScript for all new code
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Ensure security best practices

### Testing
```bash
# Run all tests
npm run test

# Run frontend tests
npm run test:frontend

# Run backend tests
npm run test:backend
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for AI/ML capabilities
- The homeless services community for guidance
- Open source contributors
- Privacy and security researchers

## 📞 Support

For questions, issues, or contributions:
- Create an issue on GitHub
- Contact the development team
- Check documentation and FAQ

---

**Built with ❤️ for our community**