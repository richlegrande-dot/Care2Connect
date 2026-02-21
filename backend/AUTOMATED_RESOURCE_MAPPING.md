# Automated City Resource Mapping Engine

## Overview

The Automated City Resource Mapping Engine is a comprehensive backend system that automatically discovers, classifies, maps, indexes, and refreshes local homeless support resources across multiple cities nationwide. This system extends the CareConnect platform with dynamic resource discovery capabilities.

## Architecture

The system consists of five core components that work together in an automated pipeline:

### 1. Resource Ingestion Engine (`/backend/src/ingestion/resource-ingestion.ts`)
- **Purpose**: Automatically discovers and extracts resource data from multiple sources
- **Data Sources**: 20+ configured sources including HUD, 211 services, city open data portals
- **Capabilities**:
  - Multi-format support (API, JSON, CSV, XML, HTML)
  - Rate limiting (100-5000 requests/hour per source)
  - Batch processing with duplicate handling
  - Comprehensive error handling and monitoring

### 2. NLP Classification Engine (`/backend/src/ai/resource-classifier.ts`)
- **Purpose**: Uses GPT-4 to categorize raw resources into standardized taxonomy
- **Features**:
  - 25+ resource categories (food, shelter, healthcare, etc.)
  - 25+ target group classifications
  - Confidence scoring and quality flags
  - Batch processing with retry logic
  - Re-classification for low-confidence results

### 3. Geolocation Mapping (`/backend/src/geolocation/geocode-mapper.ts`)
- **Purpose**: Converts addresses to coordinates with service area mapping
- **Providers**: Nominatim, Google Maps API, Census Geocoder (fallback chain)
- **Features**:
  - Accuracy scoring (rooftop to city-level)
  - Service radius calculation by category
  - Quality improvement for poor geocoding
  - Rate limiting and caching

### 4. Resource Ranking Algorithm (`/backend/src/ranking/resource-ranking.ts`)
- **Purpose**: Scores resources using 8 factors for intelligent prioritization
- **Scoring Factors**:
  - Availability (hours, 24/7 services)
  - Accessibility (transportation, barriers)
  - Capacity (wait times, bed availability)
  - Quality (accreditation, reputation)
  - Urgency (crisis services, emergency access)
  - Population match (target demographics)
  - Proximity (distance-based scoring)
  - Reliability (funding stability, consistency)
- **Weighting Profiles**: Crisis, Basic Needs, Comprehensive, Specialized, Geographic, Quality-focused

### 5. Auto-Refresh Scheduler (`/backend/src/scheduler/resource-refresh-cron.ts`)
- **Purpose**: Maintains data freshness through scheduled automated updates
- **Schedule**:
  - Daily: Data ingestion (2 AM), Classification (3 AM), Geocoding (4 AM), Ranking (5 AM)
  - Weekly: Full data refresh, comprehensive re-ranking, quality analysis
  - Monthly: Data archiving, database optimization
- **Features**:
  - Job dependency management
  - Health monitoring and alerting
  - Manual execution capabilities
  - Comprehensive error handling and retry logic

## API Endpoints

### System Status and Management
```
GET /api/automated-resources/discovery/status
- Get overall system status, pipeline statistics, and health metrics

POST /api/automated-resources/discovery/refresh
- Manually trigger data refresh (full, ingestion, classification, geocoding, ranking)
- Requires admin/data_manager role

GET /api/automated-resources/discovery/sources
- Get configured data sources and their ingestion statistics

GET /api/automated-resources/discovery/pipeline
- Get detailed pipeline processing statistics and recent job results
```

### Resource Search and Discovery
```
GET /api/automated-resources/search
- Search resources with filters: category, location, radius, target groups, priority
- Returns ranked results with scores, distances, and metadata

GET /api/automated-resources/categories
- Get available resource categories with statistics and priority counts
```

### Quality Management
```
POST /api/automated-resources/quality-improvement
- Trigger quality improvement processes for classification, geocoding, or ranking
- Requires admin/data_manager role
```

## Data Sources

### Government Sources
- HUD National Housing Database
- Census Bureau Geocoder
- State and local government databases

### 211/311 Services
- 211 LA County API
- 211 SF Bay Area API
- Local 311 service directories

### City Open Data Portals
- NYC Open Data
- Chicago Data Portal
- Seattle Open Data
- San Francisco DataSF
- Los Angeles GeoHub

### National Directories
- FindHelp.org API
- SAMHSA Treatment Locator
- Veterans Affairs databases

## Technology Stack

### Core Technologies
- **Runtime**: Node.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **AI/ML**: OpenAI GPT-4 for classification
- **Geocoding**: Nominatim, Google Maps API, Census Geocoder
- **Scheduling**: node-cron for automated jobs

### Key Dependencies
```json
{
  "openai": "^4.x",
  "axios": "^1.x",
  "cheerio": "^1.x",
  "papaparse": "^5.x",
  "node-cron": "^3.x",
  "@prisma/client": "^5.x"
}
```

## Installation & Configuration

### Environment Variables
```env
# OpenAI API for classification
OPENAI_API_KEY=your_openai_api_key

# Google Maps API for geocoding (optional)
GOOGLE_MAPS_API_KEY=your_google_maps_key

# Database connection
DATABASE_URL=postgresql://user:password@localhost:5432/careconnect

# Scheduler configuration
SCHEDULER_TIMEZONE=America/Los_Angeles
```

### Database Schema
The system requires the following database tables:
- `raw_resource_records` - Raw ingested data
- `classified_resources` - AI-classified resources
- `geocoded_resources` - Location-mapped resources
- `ranked_resources` - Scored and prioritized resources
- `refresh_job_results` - Scheduler execution logs

### Startup Configuration
```typescript
import { resourceRefreshScheduler } from './scheduler/resource-refresh-cron';

// Initialize the automated resource discovery system
resourceRefreshScheduler; // Auto-starts on import

// The scheduler will automatically:
// - Begin nightly data refresh at 2 AM
// - Monitor system health hourly
// - Perform weekly comprehensive updates
// - Archive old data monthly
```

## Performance & Scalability

### Processing Capacity
- **Daily Ingestion**: 10,000+ resources across 20+ sources
- **Classification**: 300 resources per batch with GPT-4
- **Geocoding**: 200 addresses per batch with rate limiting
- **Ranking**: 250 resources per batch with comprehensive scoring

### Rate Limiting
- **Nominatim**: 1 request/second (3,600/hour)
- **Google Maps**: 2,500 requests/day (configurable)
- **OpenAI**: Variable based on plan and usage
- **Data Sources**: 100-5000 requests/hour per source

### Quality Metrics
- **Classification Accuracy**: 85%+ confidence scores typical
- **Geocoding Success**: 90%+ successful location mapping
- **Pipeline Completion**: 80%+ raw-to-ranked conversion rate
- **Data Freshness**: 24-48 hour update cycle for most sources

## Monitoring & Alerts

### Health Checks
- Hourly pipeline health monitoring
- Failed job alerting for critical processes
- Data quality threshold monitoring
- Processing rate anomaly detection

### Quality Flags
- Low classification confidence
- Poor geocoding accuracy
- Missing contact information
- Stale data indicators
- Accessibility concerns

### Performance Metrics
- Processing throughput by component
- API response times and error rates
- Database performance and optimization needs
- Memory usage and resource consumption

## Compliance & Data Governance

### Data Handling
- Automated data source attribution
- Regular data freshness validation
- Quality scoring and confidence tracking
- Comprehensive audit logging

### Privacy Considerations
- No PII collection from public sources
- Secure API key management
- Rate limiting respect for source systems
- Data retention and archival policies

## Deployment Notes

### Production Considerations
1. **API Keys**: Secure storage of OpenAI and Google Maps credentials
2. **Database**: PostgreSQL with appropriate indexing for geospatial queries
3. **Monitoring**: Integration with logging and alerting systems
4. **Scaling**: Consider horizontal scaling for high-volume ingestion
5. **Backup**: Regular backup of processed data and configurations

### Development Setup
1. Install dependencies: `npm install`
2. Configure environment variables
3. Run database migrations: `npx prisma migrate dev`
4. Start the application: `npm run dev`
5. Monitor logs for scheduler initialization and first job runs

## Future Enhancements

### Planned Improvements
- Machine learning model for resource quality prediction
- Real-time availability checking for high-priority services
- Automated contact information verification
- Enhanced geographic clustering and service area optimization
- Integration with additional data sources and APIs

### Scalability Roadmap
- Microservices architecture for independent component scaling
- Event-driven processing with message queues
- Distributed geocoding with multiple provider load balancing
- Advanced caching strategies for improved performance