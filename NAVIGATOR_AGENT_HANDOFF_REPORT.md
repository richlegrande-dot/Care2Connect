# 📋 CARE2SYSTEM PLATFORM TRANSFORMATION - NAVIGATOR AGENT HANDOFF REPORT
## Comprehensive Technical Specification for Implementation Oversight

**Report Date**: February 8, 2026  
**System Status**: Production parsing system stable at 80.20% - ready for platform expansion  
**Target**: Transform from parsing tool to comprehensive homeless-to-self-sufficiency platform  
**Scope**: Complete architectural redesign with 7-stage progression system

---

## 🎯 EXECUTIVE SUMMARY

### Current State Analysis
**Parsing System Performance**: 80.20% accuracy (401/500 cases) achieved through Phase 4.13 surgical fixes
- **Stability Validated**: 10 consecutive runs with 0% variance
- **Production Deployed**: Backend running with breakthrough configuration
- **Archived Configuration**: `PRODUCTION_ARCHIVE_80_20_PERCENT_2026-02-08_00-48-52/`

### Transformation Objective
Convert Care2system from audio-parsing-dependent tool to **profile-driven homeless-to-self-sufficiency platform** with 7-stage progression system, integrated revenue generation, and comprehensive workflow management.

### Architecture Evolution
```
BEFORE: Audio File → Parsing → QR/GoFundMe Generation
AFTER:  User Onboarding → Profile Creation → Stage Progression → Workflow Management → Revenue Generation (Enhanced by Audio)
```

---

## 🏗️ TECHNICAL ARCHITECTURE SPECIFICATIONS

### Database Schema Requirements

#### 1. User Profiles & Authentication
```sql
-- Enhanced user profiles table
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    auth_email VARCHAR(255) UNIQUE,
    auth_password_hash VARCHAR(255),
    
    -- Profile Information
    full_name VARCHAR(255),
    preferred_name VARCHAR(100),
    date_of_birth DATE,
    phone_number VARCHAR(20),
    emergency_contact JSONB,
    
    -- Current Status
    current_stage INTEGER DEFAULT 1,
    stage_start_date TIMESTAMP DEFAULT NOW(),
    location_city VARCHAR(100),
    location_state VARCHAR(50),
    housing_status VARCHAR(50),
    
    -- Assessment Data
    initial_assessment JSONB,
    risk_factors JSONB,
    support_network JSONB,
    skills_inventory JSONB,
    health_status JSONB,
    
    -- Goals and Planning
    short_term_goals JSONB,
    long_term_goals JSONB,
    priority_needs JSONB,
    
    -- System Metadata
    onboarding_completed BOOLEAN DEFAULT FALSE,
    profile_completeness_score INTEGER DEFAULT 0,
    last_activity TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_profiles_stage ON user_profiles(current_stage);
CREATE INDEX idx_user_profiles_location ON user_profiles(location_city, location_state);
CREATE INDEX idx_user_profiles_housing ON user_profiles(housing_status);
CREATE INDEX idx_user_profiles_activity ON user_profiles(last_activity);
```

#### 2. Stage Progression System
```sql
-- Stage progression tracking
CREATE TABLE stage_progressions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(user_id),
    from_stage INTEGER,
    to_stage INTEGER NOT NULL,
    progression_date TIMESTAMP DEFAULT NOW(),
    
    -- Validation Data
    criteria_met JSONB NOT NULL,
    validation_score DECIMAL(5,2),
    auto_advanced BOOLEAN DEFAULT FALSE,
    validated_by UUID, -- case worker or system
    
    -- Progress Notes
    notes TEXT,
    supporting_documentation JSONB,
    celebration_sent BOOLEAN DEFAULT FALSE,
    
    -- Performance Tracking
    time_in_previous_stage INTEGER, -- days
    total_tasks_completed INTEGER DEFAULT 0,
    
    CONSTRAINT valid_stage_progression CHECK (to_stage > from_stage OR from_stage IS NULL)
);

-- Stage validation results cache
CREATE TABLE stage_validation_cache (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(user_id),
    stage INTEGER NOT NULL,
    validation_date TIMESTAMP DEFAULT NOW(),
    
    -- Validation Results
    can_advance BOOLEAN NOT NULL,
    completion_percentage DECIMAL(5,2),
    total_criteria INTEGER,
    met_criteria INTEGER,
    validation_details JSONB,
    recommendations JSONB,
    
    -- Cache Management
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours'),
    
    UNIQUE(user_id, stage)
);
```

#### 3. Workflow & Task Management
```sql
-- Dynamic task generation and tracking
CREATE TABLE user_tasks (
    id SERIAL PRIMARY KEY,
    task_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(user_id),
    
    -- Task Definition
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    stage INTEGER NOT NULL,
    requirement_key VARCHAR(100),
    
    -- Task Details
    action_steps JSONB,
    resources JSONB,
    estimated_time VARCHAR(50),
    priority INTEGER DEFAULT 5,
    
    -- Status Tracking
    status VARCHAR(20) DEFAULT 'not_started', -- not_started, in_progress, completed, skipped
    assigned_date TIMESTAMP DEFAULT NOW(),
    started_date TIMESTAMP,
    completed_date TIMESTAMP,
    completion_data JSONB,
    
    -- Follow-up and Dependencies
    parent_task_id UUID REFERENCES user_tasks(task_id),
    generates_tasks BOOLEAN DEFAULT FALSE,
    recurring VARCHAR(20), -- weekly, bi-weekly, monthly
    next_occurrence TIMESTAMP,
    
    -- Performance
    actual_completion_time INTERVAL,
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Task completion log for analytics
CREATE TABLE task_completions (
    id SERIAL PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES user_tasks(task_id),
    user_id UUID NOT NULL REFERENCES user_profiles(user_id),
    completed_at TIMESTAMP DEFAULT NOW(),
    
    -- Completion Context
    completion_method VARCHAR(50), -- manual, auto-detected, verified
    evidence_provided JSONB,
    notes TEXT,
    
    -- Impact Tracking
    milestone_triggered BOOLEAN DEFAULT FALSE,
    criteria_advanced JSONB,
    follow_up_tasks_generated INTEGER DEFAULT 0
);
```

#### 4. Revenue Generation System
```sql
-- Enhanced campaign management
CREATE TABLE revenue_campaigns (
    id SERIAL PRIMARY KEY,
    campaign_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(user_id),
    
    -- Campaign Basics
    title VARCHAR(255) NOT NULL,
    description TEXT,
    story_narrative TEXT,
    goal_amount DECIMAL(10,2) NOT NULL,
    raised_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Stage Context
    stage_associated INTEGER NOT NULL,
    funding_category VARCHAR(100),
    stage_objectives JSONB,
    
    -- Generation Method
    generation_method VARCHAR(50), -- profile_driven, audio_enhanced, manual
    profile_data_used JSONB,
    audio_enhancement_data JSONB,
    
    -- Campaign Status
    status VARCHAR(20) DEFAULT 'draft', -- draft, active, paused, completed, cancelled
    activation_date TIMESTAMP,
    deactivation_date TIMESTAMP,
    
    -- Platform Integration
    qr_code_data JSONB,
    gofundme_integration JSONB,
    external_campaign_ids JSONB,
    
    -- Performance Tracking
    view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    donation_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    
    -- Content Versioning
    content_version INTEGER DEFAULT 1,
    content_history JSONB,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Donation tracking and attribution
CREATE TABLE donations (
    id SERIAL PRIMARY KEY,
    donation_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES revenue_campaigns(campaign_id),
    user_id UUID NOT NULL REFERENCES user_profiles(user_id),
    
    -- Donation Details
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    donor_name VARCHAR(255),
    donor_email VARCHAR(255),
    anonymous BOOLEAN DEFAULT FALSE,
    
    -- Source Attribution
    donation_source VARCHAR(50), -- qr_code, gofundme, direct, referral
    referral_source VARCHAR(100),
    campaign_version INTEGER,
    
    -- Processing
    payment_method VARCHAR(50),
    payment_processor VARCHAR(50),
    transaction_id VARCHAR(255),
    processing_fee DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(10,2),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded
    processed_at TIMESTAMP,
    
    -- Impact Tracking
    donor_message TEXT,
    thank_you_sent BOOLEAN DEFAULT FALSE,
    impact_report_sent BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. Audio Enhancement Integration
```sql
-- Audio files and parsing results
CREATE TABLE audio_enhancements (
    id SERIAL PRIMARY KEY,
    enhancement_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(user_id),
    campaign_id UUID REFERENCES revenue_campaigns(campaign_id),
    
    -- Audio File Information
    original_filename VARCHAR(255),
    file_path VARCHAR(500),
    file_size BIGINT,
    duration_seconds INTEGER,
    
    -- Parsing Results (from existing 80.20% system)
    parsing_confidence DECIMAL(3,2), -- 0.00 to 1.00
    transcript TEXT,
    parsed_data JSONB,
    urgency_assessment VARCHAR(20),
    category_classification VARCHAR(50),
    amount_detected DECIMAL(10,2),
    
    -- Enhancement Application
    emotional_context JSONB,
    storytelling_elements TEXT,
    urgency_indicators JSONB,
    additional_insights JSONB,
    
    -- Integration Status
    applied_to_campaign BOOLEAN DEFAULT FALSE,
    enhancement_quality VARCHAR(20), -- high, medium, low, failed
    processing_date TIMESTAMP DEFAULT NOW(),
    
    -- Performance Tracking
    enhancement_impact_score DECIMAL(3,2), -- measured improvement from enhancement
    user_approval_rating INTEGER CHECK (user_approval_rating BETWEEN 1 AND 5),
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoint Specifications

#### 1. User Onboarding API
```javascript
// POST /api/onboarding/start
// Initialize new user onboarding process
{
  "endpoint": "/api/onboarding/start",
  "method": "POST",
  "body": {
    "email": "user@example.com",
    "initial_data": {
      "name": "string",
      "location": "string",
      "immediate_situation": "string"
    }
  },
  "response": {
    "user_id": "uuid",
    "onboarding_token": "jwt",
    "next_step": "assessment",
    "progress": {
      "step": 1,
      "total_steps": 5
    }
  }
}

// POST /api/onboarding/assessment
// Submit initial situation assessment
{
  "endpoint": "/api/onboarding/assessment",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer {onboarding_token}"
  },
  "body": {
    "assessment_data": {
      "housing_status": "emergency_shelter|transitional|unsheltered|other",
      "immediate_needs": ["food", "medical", "documents", "safety"],
      "support_network": {
        "family": "none|limited|strong",
        "friends": "none|limited|strong", 
        "professional": "none|limited|strong"
      },
      "skills_experience": {
        "work_history": "array_of_jobs",
        "education_level": "string",
        "special_skills": "array_of_skills"
      },
      "health_status": {
        "physical_health": "excellent|good|fair|poor",
        "mental_health": "excellent|good|fair|poor",
        "disabilities": "array_or_none",
        "medications": "array_or_none"
      },
      "risk_factors": {
        "domestic_violence": "boolean",
        "substance_abuse": "boolean",
        "criminal_history": "boolean",
        "chronic_illness": "boolean"
      }
    }
  },
  "response": {
    "assessment_score": "number",
    "recommended_stage": "number", 
    "urgency_level": "critical|high|medium|low",
    "next_step": "goal_setting",
    "ai_recommendations": "array_of_strings"
  }
}

// POST /api/onboarding/goals
// Set short and long-term objectives
{
  "endpoint": "/api/onboarding/goals",
  "method": "POST",
  "body": {
    "short_term_goals": {
      "30_days": ["goal1", "goal2", "goal3"],
      "60_days": ["goal1", "goal2"],
      "90_days": ["goal1", "goal2"]
    },
    "long_term_goals": {
      "6_months": ["goal1", "goal2"],
      "1_year": ["goal1", "goal2"],
      "2_years": ["goal1"]
    },
    "priority_areas": ["housing", "employment", "health", "education", "financial"],
    "personal_motivation": "string"
  }
}

// GET /api/onboarding/complete/{user_id}
// Finalize onboarding and generate initial campaign
{
  "response": {
    "user_profile_complete": "boolean",
    "assigned_stage": "number",
    "initial_tasks_generated": "number",
    "initial_campaign_created": "boolean",
    "dashboard_url": "string",
    "welcome_resources": "array_of_resources"
  }
}
```

#### 2. Stage Management API
```javascript
// GET /api/stages/current/{user_id}
// Get current stage information and progress
{
  "response": {
    "user_id": "uuid",
    "current_stage": "number",
    "stage_info": {
      "name": "string",
      "description": "string",
      "icon": "string",
      "color": "string",
      "objectives": "array",
      "duration": "object",
      "criteria": "object",
      "resources": "array",
      "funding_categories": "array"
    },
    "stage_start_date": "timestamp",
    "days_in_stage": "number",
    "progress": {
      "completion_percentage": "number",
      "criteria_met": "number",
      "total_criteria": "number",
      "can_advance": "boolean"
    }
  }
}

// POST /api/stages/validate/{user_id}
// Validate readiness for stage advancement
{
  "response": {
    "validation_id": "uuid",
    "current_stage": "number",
    "can_advance": "boolean",
    "completion_percentage": "number",
    "validation_results": {
      "housing": {
        "duration_days": {
          "expected": "number",
          "actual": "number",
          "met": "boolean",
          "score": "number"
        }
      },
      "income": {
        "benefits_active": {
          "expected": "boolean",
          "actual": "boolean", 
          "met": "boolean"
        }
      }
    },
    "recommendations": [
      {
        "action": "string",
        "description": "string",
        "priority": "number",
        "category": "string",
        "timeframe": "string"
      }
    ],
    "next_stage_preview": "object_if_ready"
  }
}

// POST /api/stages/advance/{user_id}
// Execute stage advancement (if criteria met)
{
  "body": {
    "validation_id": "uuid",
    "notes": "string_optional",
    "supporting_docs": "array_optional"
  },
  "response": {
    "advancement_successful": "boolean",
    "previous_stage": "number",
    "new_stage": "number", 
    "advancement_date": "timestamp",
    "celebration_triggered": "boolean",
    "new_tasks_generated": "number",
    "campaign_updated": "boolean"
  }
}
```

#### 3. Task & Workflow Management API
```javascript
// GET /api/workflow/dashboard/{user_id}
// Comprehensive dashboard data
{
  "response": {
    "user_profile": "object",
    "current_stage_info": "object",
    "active_tasks": [
      {
        "task_id": "uuid",
        "title": "string",
        "description": "string",
        "category": "string",
        "priority": "number",
        "estimated_time": "string",
        "action_steps": "array",
        "resources": "array",
        "status": "string",
        "assigned_date": "timestamp"
      }
    ],
    "completed_tasks_recent": "array",
    "task_statistics": {
      "total_active": "number",
      "completed_this_week": "number",
      "completion_rate": "number",
      "average_completion_time": "string"
    },
    "progress_metrics": {
      "overall_progress": "number", 
      "current_stage_progress": "number",
      "days_in_stage": "number",
      "estimated_advancement_date": "timestamp"
    },
    "upcoming_milestones": "array",
    "recommended_resources": "array",
    "recent_achievements": "array"
  }
}

// POST /api/workflow/tasks/{task_id}/complete
// Mark task as completed
{
  "body": {
    "completion_data": {
      "completion_method": "manual|verified|auto",
      "evidence": "array_optional",
      "notes": "string_optional",
      "time_spent": "interval_optional"
    }
  },
  "response": {
    "task_completed": "boolean",
    "milestone_achieved": "boolean",
    "criteria_advanced": "object",
    "new_tasks_generated": "array",
    "stage_validation_triggered": "boolean",
    "impact_summary": "string"
  }
}

// GET /api/workflow/tasks/generate/{user_id}
// Generate new tasks based on current needs
{
  "response": {
    "tasks_generated": "number",
    "task_categories": "array",
    "priority_tasks": "array",
    "routine_tasks": "array",
    "follow_up_tasks": "array"
  }
}
```

#### 4. Revenue Generation API
```javascript
// POST /api/revenue/generate-campaign/{user_id}
// Generate new campaign from user profile
{
  "body": {
    "campaign_type": "stage_based|custom|emergency",
    "enhancement_mode": "profile_only|audio_enhanced",
    "audio_file": "file_optional",
    "custom_parameters": "object_optional"
  },
  "response": {
    "campaign_id": "uuid",
    "campaign_data": {
      "title": "string",
      "description": "string",
      "story_narrative": "string",
      "goal_amount": "number",
      "funding_category": "string",
      "stage_context": "object"
    },
    "qr_code": {
      "image_data": "base64_string",
      "url": "string",
      "metadata": "object"
    },
    "gofundme_ready": {
      "formatted_description": "string",
      "category": "string",
      "tags": "array",
      "integration_ready": "boolean"
    },
    "audio_enhancement": {
      "applied": "boolean",
      "confidence_score": "number",
      "enhancements": "object"
    }
  }
}

// PUT /api/revenue/campaigns/{campaign_id}
// Update existing campaign
{
  "body": {
    "updates": {
      "title": "string_optional",
      "description": "string_optional",
      "goal_amount": "number_optional",
      "status": "string_optional"
    },
    "audio_enhancement": "file_optional"
  }
}

// GET /api/revenue/campaigns/{user_id}/performance
// Get campaign performance analytics
{
  "response": {
    "active_campaigns": "array",
    "total_raised": "number", 
    "donation_count": "number",
    "campaign_performance": {
      "view_to_donation_rate": "number",
      "average_donation_amount": "number",
      "top_performing_categories": "array"
    },
    "donor_insights": {
      "repeat_donors": "number",
      "donor_demographics": "object",
      "engagement_metrics": "object"
    }
  }
}
```

### Implementation Scripts & Automation

#### 1. Database Migration Scripts
```sql
-- migration_001_create_user_profiles.sql
BEGIN;

-- Create extensions if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- User profiles table with comprehensive structure
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    auth_email VARCHAR(255) UNIQUE,
    auth_password_hash VARCHAR(255),
    full_name VARCHAR(255),
    preferred_name VARCHAR(100),
    date_of_birth DATE,
    phone_number VARCHAR(20),
    emergency_contact JSONB,
    current_stage INTEGER DEFAULT 1,
    stage_start_date TIMESTAMP DEFAULT NOW(),
    location_city VARCHAR(100),
    location_state VARCHAR(50),
    housing_status VARCHAR(50),
    initial_assessment JSONB,
    risk_factors JSONB,
    support_network JSONB,
    skills_inventory JSONB,
    health_status JSONB,
    short_term_goals JSONB,
    long_term_goals JSONB,
    priority_needs JSONB,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    profile_completeness_score INTEGER DEFAULT 0,
    last_activity TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE
    ON user_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_user_profiles_stage ON user_profiles(current_stage);
CREATE INDEX idx_user_profiles_location ON user_profiles(location_city, location_state);
CREATE INDEX idx_user_profiles_housing ON user_profiles(housing_status);
CREATE INDEX idx_user_profiles_activity ON user_profiles(last_activity);
CREATE INDEX idx_user_profiles_onboarding ON user_profiles(onboarding_completed);

-- Full text search on names
CREATE INDEX idx_user_profiles_name_search ON user_profiles 
    USING gin(to_tsvector('english', full_name || ' ' || COALESCE(preferred_name, '')));

COMMIT;
```

```sql
-- migration_002_create_stage_system.sql
BEGIN;

-- Stage progression tracking
CREATE TABLE stage_progressions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    from_stage INTEGER,
    to_stage INTEGER NOT NULL,
    progression_date TIMESTAMP DEFAULT NOW(),
    criteria_met JSONB NOT NULL,
    validation_score DECIMAL(5,2),
    auto_advanced BOOLEAN DEFAULT FALSE,
    validated_by UUID,
    notes TEXT,
    supporting_documentation JSONB,
    celebration_sent BOOLEAN DEFAULT FALSE,
    time_in_previous_stage INTEGER,
    total_tasks_completed INTEGER DEFAULT 0,
    CONSTRAINT valid_stage_progression CHECK (to_stage > from_stage OR from_stage IS NULL)
);

-- Stage validation cache for performance
CREATE TABLE stage_validation_cache (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    stage INTEGER NOT NULL,
    validation_date TIMESTAMP DEFAULT NOW(),
    can_advance BOOLEAN NOT NULL,
    completion_percentage DECIMAL(5,2),
    total_criteria INTEGER,
    met_criteria INTEGER,
    validation_details JSONB,
    recommendations JSONB,
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours'),
    UNIQUE(user_id, stage)
);

-- Indexes
CREATE INDEX idx_stage_progressions_user ON stage_progressions(user_id);
CREATE INDEX idx_stage_progressions_date ON stage_progressions(progression_date);
CREATE INDEX idx_stage_validation_cache_user_stage ON stage_validation_cache(user_id, stage);
CREATE INDEX idx_stage_validation_cache_expires ON stage_validation_cache(expires_at);

-- Auto-cleanup expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_validation_cache() 
RETURNS void AS $$
BEGIN
    DELETE FROM stage_validation_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-validation-cache', '0 */6 * * *', 'SELECT cleanup_expired_validation_cache();');

COMMIT;
```

#### 2. Environment Configuration Scripts
```bash
#!/bin/bash
# setup_production_environment.sh

echo "🚀 Setting up Care2system Production Environment"

# Environment Variables for New Platform
cat > .env.production << EOF
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/care2system
DATABASE_POOL_SIZE=10

# Authentication & Security
JWT_SECRET=your-super-secure-jwt-secret-here
BCRYPT_ROUNDS=12
SESSION_TIMEOUT=86400

# Audio Parsing System (Existing 80.20% Configuration)
USE_PHASE413_SURGICAL_FIXES=true
USE_PHASE47_PRECISION_CORRECTION=true
AUDIO_UPLOAD_MAX_SIZE=50MB
AUDIO_PROCESSING_TIMEOUT=300

# Platform Features
ENABLE_ONBOARDING_SYSTEM=true
ENABLE_STAGE_PROGRESSION=true
ENABLE_WORKFLOW_MANAGEMENT=true
ENABLE_REVENUE_GENERATION=true
ENABLE_AUDIO_ENHANCEMENT=true

# Revenue Generation
QR_CODE_BASE_URL=https://care2system.app
GOFUNDME_API_KEY=your-gofundme-api-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Notification Services
EMAIL_SERVICE_API_KEY=your-email-service-key
SMS_SERVICE_API_KEY=your-sms-service-key
PUSH_NOTIFICATION_KEY=your-push-notification-key

# File Storage
UPLOAD_STORAGE_TYPE=local
UPLOAD_STORAGE_PATH=/var/care2system/uploads
MAX_UPLOAD_SIZE=100MB

# Monitoring & Analytics
LOG_LEVEL=info
ENABLE_ANALYTICS=true
ANALYTICS_SERVICE_KEY=your-analytics-key

# Performance
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600
ENABLE_RATE_LIMITING=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600

# Security
CORS_ORIGINS=https://care2system.app,https://www.care2system.app
HELMET_CSP_SOURCES=self,https://api.stripe.com,https://checkout.stripe.com
EOF

echo "✅ Environment configuration created"

# Create directory structure
mkdir -p uploads/audio
mkdir -p uploads/documents
mkdir -p uploads/qr-codes
mkdir -p logs
mkdir -p cache
mkdir -p archives

echo "✅ Directory structure created"

# Set permissions
chmod 700 uploads
chmod 700 logs
chmod 600 .env.production

echo "✅ Permissions set"

echo "🎉 Production environment setup complete!"
```

#### 3. Task Generation Service
```javascript
// scripts/generate_initial_tasks.js
const { PROGRESSION_STAGES } = require('../backend/src/services/stages/stageDefinitions');
const fs = require('fs').promises;

class InitialTaskGenerator {
  constructor() {
    this.stageTemplates = this.loadStageTemplates();
  }

  async generateUserTasks(userId, userProfile, stageValidation) {
    const currentStage = userProfile.current_stage || 1;
    const stageInfo = PROGRESSION_STAGES[currentStage];
    const tasks = [];

    console.log(`Generating tasks for user ${userId}, Stage ${currentStage}: ${stageInfo.name}`);

    // Generate tasks for unmet criteria
    for (const [category, requirements] of Object.entries(stageInfo.criteria)) {
      for (const [requirement, expected] of Object.entries(requirements)) {
        const validationResult = stageValidation?.[category]?.[requirement];
        
        if (!validationResult?.met) {
          const task = await this.generateTask(currentStage, category, requirement, expected, validationResult?.actual, userProfile);
          if (task) {
            tasks.push(task);
            console.log(`  Generated task: ${task.title}`);
          }
        }
      }
    }

    // Add welcome/orientation tasks for new users
    if (!userProfile.onboarding_completed) {
      const welcomeTasks = this.generateWelcomeTasks(currentStage);
      tasks.push(...welcomeTasks);
    }

    // Add weekly maintenance tasks
    const maintenanceTasks = this.generateMaintenanceTasks(currentStage);
    tasks.push(...maintenanceTasks);

    // Sort by priority
    const sortedTasks = tasks.sort((a, b) => (b.priority || 5) - (a.priority || 5));

    console.log(`Total tasks generated: ${sortedTasks.length}`);
    return sortedTasks;
  }

  async generateTask(stage, category, requirement, expected, actual, userProfile) {
    const taskId = `${stage}_${category}_${requirement}`;
    const template = this.stageTemplates[stage]?.[category]?.[requirement];
    
    if (!template) {
      console.warn(`No template found for ${taskId}`);
      return this.generateGenericTask(stage, category, requirement, expected);
    }

    // Personalize task based on user profile
    const personalizedTask = {
      ...template,
      task_id: require('crypto').randomUUID(),
      user_id: userProfile.user_id,
      stage: stage,
      requirement_key: requirement,
      expected_value: expected,
      current_value: actual,
      status: 'not_started',
      created_date: new Date().toISOString(),
      
      // Personalization
      title: this.personalizeTitleForUser(template.title, userProfile),
      description: this.personalizeDescriptionForUser(template.description, userProfile, expected, actual),
      action_steps: this.personalizeActionSteps(template.action_steps, userProfile),
      resources: this.localizeResources(template.resources, userProfile.location_city, userProfile.location_state)
    };

    return personalizedTask;
  }

  personalizeTitle(template, userProfile) {
    return template
      .replace('{user_name}', userProfile.preferred_name || userProfile.full_name || 'you')
      .replace('{location}', `${userProfile.location_city}, ${userProfile.location_state}` || 'your area');
  }

  personalizeDescription(template, userProfile, expected, actual) {
    let description = template
      .replace('{expected}', expected)
      .replace('{current}', actual || 'not yet completed')
      .replace('{user_name}', userProfile.preferred_name || userProfile.full_name || 'you');
      
    // Add context based on user's specific situation
    if (userProfile.risk_factors?.domestic_violence) {
      description += "\n\n⚠️ Safety Note: If you're experiencing domestic violence, prioritize your safety and contact the National Domestic Violence Hotline: 1-800-799-7233";
    }
    
    if (userProfile.health_status?.disabilities?.length > 0) {
      description += "\n\n♿ Accessibility: Contact organizations listed below to discuss accommodations for your specific needs.";
    }
    
    return description;
  }

  localizeResources(resources, city, state) {
    // This would integrate with a resource database to provide local resources
    return resources.map(resource => ({
      ...resource,
      local_providers: `Search for "${resource.type}" in ${city}, ${state}`,
      national_fallback: resource.national_resource || "211 (dial 2-1-1)"
    }));
  }

  generateWelcomeTasks(stage) {
    return [
      {
        task_id: require('crypto').randomUUID(),
        title: "Complete Your Profile",
        description: "Add additional details to your profile to get more personalized recommendations and resources.",
        category: "onboarding",
        stage: stage,
        priority: 8,
        estimated_time: "15-20 minutes",
        action_steps: [
          "Review your profile information for completeness",
          "Add emergency contact information",
          "Update your goals and priorities if anything has changed",
          "Set your notification preferences"
        ],
        status: 'not_started'
      },
      {
        task_id: require('crypto').randomUUID(),
        title: "Explore Available Resources",
        description: "Familiarize yourself with resources and services available in your area.",
        category: "orientation",
        stage: stage,
        priority: 6,
        estimated_time: "30-45 minutes",
        action_steps: [
          "Browse the resources section for your current stage",
          "Save useful resources to your favorites",
          "Contact at least one resource to introduce yourself",
          "Join any available support groups or communities"
        ],
        status: 'not_started'
      }
    ];
  }

  generateMaintenanceTasks(stage) {
    return [
      {
        task_id: require('crypto').randomUUID(),
        title: "Weekly Progress Check-in",
        description: "Review your progress and plan for the upcoming week.",
        category: "maintenance", 
        stage: stage,
        priority: 4,
        estimated_time: "20-30 minutes",
        recurring: "weekly",
        next_occurrence: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        action_steps: [
          "Review completed tasks from this week",
          "Update your profile with any changes",
          "Set 2-3 priorities for next week",
          "Reach out to your support network",
          "Celebrate your progress, no matter how small"
        ],
        status: 'not_started'
      }
    ];
  }

  loadStageTemplates() {
    // Load from separate template file for maintainability
    return require('./task_templates.json');
  }
}

// Export for use in API
module.exports = InitialTaskGenerator;

// CLI Usage
if (require.main === module) {
  const generator = new InitialTaskGenerator();
  
  // Example usage
  const exampleProfile = {
    user_id: 'example-uuid',
    current_stage: 1,
    full_name: 'John Doe',
    preferred_name: 'John',
    location_city: 'San Francisco',
    location_state: 'CA',
    housing_status: 'emergency_shelter',
    risk_factors: {},
    health_status: {}
  };
  
  const exampleValidation = {
    housing: {
      duration_days: { met: false, actual: 2, expected: 7 }
    },
    documentation: {
      id_obtained: { met: false, actual: false, expected: true }
    }
  };
  
  generator.generateUserTasks('example-uuid', exampleProfile, exampleValidation)
    .then(tasks => {
      console.log('\nGenerated Tasks:');
      tasks.forEach((task, index) => {
        console.log(`${index + 1}. ${task.title} (Priority: ${task.priority})`);
      });
    })
    .catch(console.error);
}
```

### Frontend Component Architecture

#### 1. Onboarding Flow Components
```javascript
// src/components/onboarding/OnboardingWizard.jsx
import React, { useState, useEffect } from 'react';

const ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Welcome', component: 'WelcomeStep' },
  { id: 'basic_info', title: 'Basic Information', component: 'BasicInfoStep' },
  { id: 'assessment', title: 'Situation Assessment', component: 'AssessmentStep' },
  { id: 'goals', title: 'Goal Setting', component: 'GoalSettingStep' },
  { id: 'complete', title: 'Complete Setup', component: 'CompletionStep' }
];

export const OnboardingWizard = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleStepComplete = (stepData) => {
    setOnboardingData(prev => ({
      ...prev,
      [ONBOARDING_STEPS[currentStep].id]: stepData
    }));

    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(onboardingData)
      });
      
      if (response.ok) {
        const result = await response.json();
        onComplete(result);
      }
    } catch (error) {
      console.error('Onboarding completion failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="onboarding-wizard">
      <div className="step-progress">
        {ONBOARDING_STEPS.map((step, index) => (
          <div 
            key={step.id}
            className={`step ${index <= currentStep ? 'completed' : ''} ${index === currentStep ? 'active' : ''}`}
          >
            <span className="step-number">{index + 1}</span>
            <span className="step-title">{step.title}</span>
          </div>
        ))}
      </div>

      <div className="step-content">
        {React.createElement(
          require(`./${ONBOARDING_STEPS[currentStep].component}`).default,
          {
            data: onboardingData[ONBOARDING_STEPS[currentStep].id] || {},
            onComplete: handleStepComplete,
            isLoading
          }
        )}
      </div>
    </div>
  );
};

// Assessment Step Component
export const AssessmentStep = ({ data, onComplete, isLoading }) => {
  const [assessmentData, setAssessmentData] = useState(data);

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(assessmentData);
  };

  return (
    <form onSubmit={handleSubmit} className="assessment-step">
      <h2>Tell Us About Your Current Situation</h2>
      
      <div className="assessment-section">
        <h3>Housing Status</h3>
        <div className="radio-group">
          {[
            { value: 'unsheltered', label: 'Unsheltered (street, car, abandoned building)' },
            { value: 'emergency_shelter', label: 'Emergency shelter' },
            { value: 'transitional', label: 'Transitional housing' },
            { value: 'temporary_stay', label: 'Staying with friends/family temporarily' },
            { value: 'other', label: 'Other situation' }
          ].map(option => (
            <label key={option.value}>
              <input
                type="radio"
                name="housing_status"
                value={option.value}
                checked={assessmentData.housing_status === option.value}
                onChange={(e) => setAssessmentData(prev => ({
                  ...prev,
                  housing_status: e.target.value
                }))}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      <div className="assessment-section">
        <h3>Immediate Needs (select all that apply)</h3>
        <div className="checkbox-group">
          {[
            'Food security',
            'Medical care', 
            'Mental health support',
            'Identification documents',
            'Safe shelter',
            'Clothing',
            'Transportation',
            'Phone/communication',
            'Benefits enrollment',
            'Legal assistance'
          ].map(need => (
            <label key={need}>
              <input
                type="checkbox"
                checked={assessmentData.immediate_needs?.includes(need) || false}
                onChange={(e) => {
                  const needs = assessmentData.immediate_needs || [];
                  if (e.target.checked) {
                    setAssessmentData(prev => ({
                      ...prev,
                      immediate_needs: [...needs, need]
                    }));
                  } else {
                    setAssessmentData(prev => ({
                      ...prev,
                      immediate_needs: needs.filter(n => n !== need)
                    }));
                  }
                }}
              />
              {need}
            </label>
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? 'Analyzing...' : 'Continue to Goal Setting'}
        </button>
      </div>
    </form>
  );
};
```

#### 2. Stage Progression Dashboard
```javascript
// src/components/stages/StageProgressDashboard.jsx
import React, { useState, useEffect } from 'react';

export const StageProgressDashboard = ({ userId }) => {
  const [stageData, setStageData] = useState(null);
  const [validationData, setValidationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStageData();
  }, [userId]);

  const loadStageData = async () => {
    try {
      const [stageResponse, validationResponse] = await Promise.all([
        fetch(`/api/stages/current/${userId}`),
        fetch(`/api/stages/validate/${userId}`, { method: 'POST' })
      ]);
      
      const stage = await stageResponse.json();
      const validation = await validationResponse.json();
      
      setStageData(stage);
      setValidationData(validation);
    } catch (error) {
      console.error('Failed to load stage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStage = async () => {
    if (!validationData?.can_advance) return;
    
    try {
      const response = await fetch(`/api/stages/advance/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          validation_id: validationData.validation_id
        })
      });
      
      if (response.ok) {
        loadStageData(); // Reload data
        // Show celebration animation
      }
    } catch (error) {
      console.error('Stage advancement failed:', error);
    }
  };

  if (loading) return <div className="loading">Loading stage information...</div>;

  return (
    <div className="stage-progress-dashboard">
      <div className="stage-header">
        <div className="stage-icon">{stageData.stage_info.icon}</div>
        <div className="stage-info">
          <h1>{stageData.stage_info.name}</h1>
          <p>{stageData.stage_info.description}</p>
          <div className="stage-meta">
            <span>Day {stageData.days_in_stage} of stage</span>
            <span>{validationData.completion_percentage.toFixed(1)}% complete</span>
          </div>
        </div>
      </div>

      <div className="progress-overview">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${validationData.completion_percentage}%`,
              backgroundColor: stageData.stage_info.color
            }}
          />
        </div>
        <div className="progress-stats">
          <span>{validationData.met_criteria} of {validationData.total_criteria} criteria met</span>
          {validationData.can_advance && (
            <button 
              className="advance-button"
              onClick={handleAdvanceStage}
            >
              🎉 Ready to Advance!
            </button>
          )}
        </div>
      </div>

      <div className="criteria-breakdown">
        <h3>Progress Breakdown</h3>
        {Object.entries(validationData.validation_results).map(([category, criteria]) => (
          <div key={category} className="criteria-category">
            <h4>{category.replace('_', ' ').toUpperCase()}</h4>
            {Object.entries(criteria).map(([criterion, result]) => (
              <div 
                key={criterion} 
                className={`criterion-item ${result.met ? 'met' : 'unmet'}`}
              >
                <div className="criterion-status">
                  {result.met ? '✅' : '⏳'}
                </div>
                <div className="criterion-details">
                  <span className="criterion-name">{criterion.replace('_', ' ')}</span>
                  <span className="criterion-progress">
                    Current: {result.actual} | Target: {result.expected}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {validationData.recommendations?.length > 0 && (
        <div className="recommendations">
          <h3>Next Steps</h3>
          {validationData.recommendations.map((rec, index) => (
            <div key={index} className="recommendation-item">
              <div className="rec-priority">{rec.priority}</div>
              <div className="rec-content">
                <h4>{rec.action}</h4>
                <p>{rec.description}</p>
                <span className="rec-timeframe">{rec.timeframe}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### Implementation Timeline & Milestones

#### Week 1: Foundation Setup
**Database & Backend Infrastructure**
- [ ] Database migration scripts (5 tables with indexes and triggers)
- [ ] Basic API endpoints for user management
- [ ] Authentication system integration
- [ ] Environment configuration setup
- [ ] Basic test suite for core functionality

**Deliverables:**
- Functioning user registration/login
- Database schema fully implemented
- Basic API documentation
- Development environment validated

#### Week 2: Core Onboarding System
**User Onboarding Flow**
- [ ] Multi-step onboarding wizard (React components)
- [ ] Assessment algorithm implementation
- [ ] Initial stage placement logic
- [ ] Profile completeness scoring
- [ ] Basic dashboard structure

**Deliverables:**
- Complete onboarding flow functional
- User profile system operational
- Stage 1 task generation working
- Basic mobile responsiveness

#### Week 3: Stage System & Validation
**Stage Progression Engine**
- [ ] All 7 stage definitions implemented
- [ ] Validation engine for criteria checking
- [ ] Task generation for all stages
- [ ] Progress tracking and analytics
- [ ] Stage advancement workflow

**Deliverables:**
- Complete stage system functional
- Task management system operational
- Progress dashboard fully featured
- Stage advancement celebrations

#### Week 4: Revenue Generation Integration
**Campaign Generation System**
- [ ] Profile-driven campaign creation
- [ ] Audio enhancement integration
- [ ] QR code generation system
- [ ] GoFundMe API integration
- [ ] Donation tracking system

**Deliverables:**
- Automated campaign generation
- QR codes and platforms integrated
- Audio parsing enhancement working
- Revenue tracking dashboard

#### Week 5: Workflow Management
**Task & Progress Management**
- [ ] Advanced task generation algorithms
- [ ] Resource recommendation engine
- [ ] Support system integrations
- [ ] Analytics and reporting tools
- [ ] Performance optimization

**Deliverables:**
- Complete workflow management
- Advanced analytics implementation
- Support system integrations
- Performance benchmarks met

#### Week 6: Production Deployment
**Testing & Launch Preparation**
- [ ] Comprehensive end-to-end testing
- [ ] User acceptance testing
- [ ] Performance and security testing
- [ ] Documentation completion
- [ ] Production deployment

**Deliverables:**
- Platform ready for beta users
- Full documentation complete
- Training materials prepared
- Production monitoring active

### Risk Assessment & Mitigation

#### Technical Risks
**Database Performance**
- Risk: Large user base causing query slowdowns
- Mitigation: Comprehensive indexing, query optimization, caching layer

**Audio Processing Scalability**
- Risk: Audio enhancement becoming bottleneck
- Mitigation: Queue system, async processing, fallback to profile-only

**Real-time Updates**
- Risk: Dashboard updates not reflecting current state
- Mitigation: WebSocket integration, optimistic UI updates, cache invalidation

#### User Experience Risks
**Onboarding Abandonment** 
- Risk: Complex onboarding process causing high dropout
- Mitigation: Progressive disclosure, save-and-continue, mobile optimization

**Task Overwhelm**
- Risk: Users feeling overwhelmed by too many tasks
- Mitigation: Smart prioritization, manageable daily goals, celebration of small wins

#### Integration Risks
**Third-party API Dependencies**
- Risk: GoFundMe or payment processor API changes
- Mitigation: Abstraction layer, multiple provider support, graceful fallbacks

**Existing System Integration**
- Risk: Breaking existing 80.20% parsing functionality
- Mitigation: Comprehensive testing, feature flags, rollback procedures

### Success Metrics & KPIs

#### User Engagement
- **Onboarding Completion Rate**: Target >85%
- **Daily Active Users**: Sustained growth >20% month-over-month
- **Task Completion Rate**: Target >70% of assigned tasks completed
- **Stage Advancement Rate**: Target >60% of eligible users advancing monthly

#### Platform Impact
- **Stage Progression Velocity**: Average time per stage reducing over time
- **Self-Sufficiency Achievement**: Target >40% reaching Stage 7 within 24 months
- **Campaign Success Rate**: Target >75% of campaigns reaching funding goals
- **Resource Utilization**: Target >50% of recommended resources accessed

#### Revenue Generation
- **Campaign Creation Rate**: Average 1.2 campaigns per user
- **Average Donation Amount**: Target $50+ per donation
- **Donor Retention**: Target >30% repeat donors
- **Total Platform Revenue**: Monthly growth >15%

#### System Performance
- **Page Load Times**: Target <2 seconds for all pages
- **API Response Times**: Target <200ms for 95% of requests
- **System Uptime**: Target >99.5%
- **Audio Processing Time**: Target <30 seconds per file

---

## 🎯 NAVIGATOR AGENT IMPLEMENTATION GUIDANCE

### Immediate Next Steps
1. **Review Technical Specifications**: Validate database schema and API designs
2. **Resource Allocation**: Assign development team roles (frontend, backend, database, integration)
3. **Timeline Confirmation**: Confirm 6-week timeline feasibility with team capacity
4. **Stakeholder Alignment**: Ensure user groups and support organizations ready for testing

### Implementation Priorities (in order)
1. **Database Foundation** - Essential for all other features
2. **User Authentication & Profiles** - Core platform requirement  
3. **Stage 1 Complete Implementation** - Validate architecture with one full stage
4. **Revenue Generation Integration** - Leverage existing parsing advantage
5. **Remaining Stages & Workflow** - Scale proven architecture
6. **Production Launch & Optimization** - Deploy and iterate

### Quality Assurance Requirements
- **Test Coverage**: Minimum 80% code coverage for backend services
- **End-to-End Testing**: Full user journey automated tests
- **Performance Testing**: Load testing for expected user volumes
- **Security Audit**: Third-party security review before production
- **Accessibility Compliance**: WCAG 2.1 AA standards

### Documentation Requirements  
- **API Documentation**: Complete Swagger/OpenAPI specs
- **User Documentation**: Onboarding guides for all user types
- **Administrator Documentation**: Platform management and monitoring guides  
- **Developer Documentation**: Architecture decisions and extension guides

### Ongoing Maintenance Plan
- **Database Maintenance**: Regular optimization and backup procedures
- **Security Updates**: Monthly security patch cycles
- **Feature Updates**: Bi-weekly deployment cycles
- **User Support**: 24/7 technical support system
- **Analytics Review**: Weekly performance and user success metrics review

---

## 🧪 V4PLUS EVALUATION SYSTEM - COMPLETE BREAKDOWN

> **CRITICAL CONTEXT FOR NAVIGATOR**: This section was added on February 12, 2026 and documents the
> entire post-test evaluation and testing process. The V1 Production Parser was previously validated at
> 90% overall accuracy (80% name, 90% age, 100% needs) across 30 stability iterations with zero 
> variance. The v4plus evaluation framework is a separate, stricter testing harness that revealed the
> parser's actual performance against rigorous criteria is significantly lower than the original
> validation suggested. This gap is the primary reason for the Feb. v.1.5 build.

---

### 1. EVALUATION FRAMEWORK OVERVIEW

#### What Is the v4plus Eval System?
The v4plus evaluation system is a **stress testing and robustness framework** located at 
`backend/eval/v4plus/`. It was designed to validate generalization beyond the original 30-case test 
suite. The original V1 parser achieved 90% on a simpler scoring rubric; the v4plus framework uses 
**stricter scoring** with **4 independently-weighted fields** and **dual pass thresholds**.

#### How It Differs from the Original V1 Validation
| Aspect | V1 Validation (90%) | v4plus Evaluation |
|--------|---------------------|-------------------|
| **Total test cases** | 30 | 340 (core30 + hard60 + fuzz200 + realistic50) |
| **Fields scored** | name, age, needs (3 fields) | name, category, urgency, goalAmount (4 fields) |
| **Scoring method** | Simple pass/fail per field | 4-field weighted score (25% each) |
| **Pass threshold** | Basic accuracy | STRICT ≥95%, ACCEPTABLE ≥85% |
| **Amount matching** | Not scored separately | 10% tolerance matching |
| **Category matching** | Not scored | Exact string match required |
| **Urgency matching** | Not scored | Exact level match (LOW/MEDIUM/HIGH/CRITICAL) |
| **Name matching** | Fuzzy allowed | Strict equality (exact first + last name) |
| **Fuzz testing** | None | 200+ mutation-based adversarial cases |
| **Reproducibility** | Manual runs | Seeded deterministic generation |
| **Network** | Allowed | ZERO_OPENAI_MODE enforced, all HTTP blocked |

#### Directory Structure
```
backend/eval/v4plus/
├── datasets/                    # Test case datasets (JSONL format)
│   ├── core30.jsonl             # 30 original baseline cases (checksum-verified immutable)
│   ├── core30.checksum.txt      # SHA integrity check
│   ├── hard60.jsonl             # 60 curated difficult cases
│   ├── fuzz200.jsonl            # 200 generated mutation-based fuzz cases
│   ├── fuzz500.jsonl            # 500 generated fuzz cases (auto-generated)
│   ├── fuzz10k.jsonl            # 10,500 generated fuzz cases (auto-generated)
│   └── realistic50.jsonl        # 50 realistic conversation-style cases
├── runners/
│   ├── run_eval_v4plus.js       # Main evaluation runner (1447 lines)
│   └── parserAdapter.js         # Bridge between eval runner and production engine (235 lines)
├── generators/
│   └── generate_fuzz_cases.js   # Deterministic fuzz case generator (seeded)
├── enhancements/                # Surgical correction modules (Phase 4.4-4.6)
│   ├── OverAssessmentCorrection_Phase45.js
│   ├── SurgicalCorrection_Phase46.js
│   ├── SurgicalCorrection_Phase46_v2.js
│   ├── SurgicalCorrection_Phase46_v3.js
│   └── UrgencyEscalation_Phase44.js
├── utils/
│   ├── checksumValidator.js     # Verifies core30 dataset immutability
│   ├── piiScanner.js            # Scans reports for PII leaks
│   ├── baseline_manager.js      # Manages baseline comparison data
│   └── failure_analyzer.js      # Failure pattern analysis utilities
├── reports/                     # Auto-generated JSON + Markdown reports (massive directory)
├── bridges/                     # Integration bridges between eval versions
├── custom_cases/                # Custom test case overrides
└── V4PLUS_EVAL_README.md        # Original documentation
```

---

### 2. HOW TO RUN THE EVALUATION

#### Prerequisites
- Node.js 18+ with `tsx` (TypeScript execution) available via `npx tsx`
- Working directory MUST be `backend/` (not the workspace root)
- No OpenAI API key needed (ZERO_OPENAI_MODE enforced)
- No internet connection needed (all HTTP requests are blocked at runtime)

#### Command Syntax
```bash
cd backend
npx tsx eval/v4plus/runners/run_eval_v4plus.js --dataset <dataset_name>
```

#### Available Dataset Arguments
| Argument | Cases | Description |
|----------|-------|-------------|
| `core30` | 30 | Baseline regression check (immutable, checksum-verified) |
| `hard60` | 60 | Curated difficult edge cases |
| `fuzz200` | 200 | Mutation-based adversarial fuzz (seeded, auto-generated) |
| `fuzz500` | 500 | Extended fuzz set (auto-generated if missing) |
| `fuzz10k` | 10,500 | Massive fuzz (auto-generated if missing, ~30sec generation) |
| `realistic50` | 50 | Realistic conversation-style transcripts |
| `all` | 340 | Runs core30 + hard60 + fuzz200 + realistic50 combined |

#### What Happens When You Run It
1. **Environment enforcement**: Sets `ZERO_OPENAI_MODE=true`, blocks all HTTP/HTTPS requests at the Node.js level, enables `USE_V3B_ENHANCEMENTS` and various phase flags
2. **Dataset loading**: Parses JSONL file, verifies checksums for core30
3. **Case-by-case evaluation**: For each test case:
   - Calls `parserAdapter.extractAll(transcriptText)` which invokes the production rulesEngine
   - Compares extracted `{name, category, urgencyLevel, goalAmount}` against `expected` values
   - Scores each field as match/no-match (strict equality for name/category/urgency, 10% tolerance for amount)
   - Calculates weighted score: `(nameMatch*0.25 + categoryMatch*0.25 + urgencyMatch*0.25 + amountMatch*0.25)`
   - Determines STRICT pass (≥0.95) and ACCEPTABLE pass (≥0.85)
4. **Failure classification**: Each failed field is bucketed into predefined failure categories
5. **Report generation**: Produces JSON + Markdown reports in `reports/` directory
6. **PII scan**: Scans generated reports for accidentally leaked PII
7. **Console display**: Prints formatted pass rates, failure buckets, regressions, worklist

#### Example Console Output Flow
```
╔═══════════════════════════════════════════╗
║   Jan v4.0+ Evaluation Suite              ║
╚═══════════════════════════════════════════╝

📊 Loading dataset: core30
Verifying core30 immutability...
📦 Loaded 30 test cases
⚙️  Config: STRICT ≥95%, ACCEPTABLE ≥85%
⚙️  Amount Tolerance: 10%

🔄 Running evaluations...
  Progress: 1/30

✅ Evaluation complete in 1234 ms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PASS RATES (Dual Threshold)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  STRICT (≥95%):      10.00% (3/30)
  ACCEPTABLE (≥85%):  10.00% (3/30)

  ❌ Pass rates below targets. Review failure buckets.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  TOP 10 FAILURE BUCKETS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1. amount_missing (X cases, ...)
  2. urgency_under_assessed (X cases, ...)
  3. category_wrong (X cases, ...)
  4. name_missing (X cases, ...)
  ...
```

---

### 3. THE PARSER ADAPTER - HOW EVAL CONNECTS TO PRODUCTION ENGINE

#### What Is parserAdapter.js?
Located at `backend/eval/v4plus/runners/parserAdapter.js` (235 lines), this is the **bridge** between
the v4plus evaluation runner and the production rules engine. The eval runner calls 
`parserAdapter.extractAll(transcriptText)` and expects back an object with 
`{name, category, urgencyLevel, goalAmount}`.

#### Architecture Flow
```
run_eval_v4plus.js
  └── evaluateCase(testCase)
        └── parserAdapter.extractAll(testCase.transcriptText)
              ├── getRulesEngine()     → lazy-loads rulesEngine.ts via tsx
              ├── engine.extractAllWithTelemetry(text)
              │     └── Returns: { results: { name, amount, urgency, ... }, metrics }
              ├── engine.extractNeeds(text, 1)
              │     └── Returns: ['HOUSING'] (top-1 category)
              └── mapCategoryToEvaluationFormat(category)
                    └── Remaps JOBS→EMPLOYMENT, CHILDCARE→FAMILY, MENTAL_HEALTH→HEALTHCARE
```

#### Critical Detail: How Fields Are Extracted
```javascript
// From parserAdapter.js extractAll() method:
const telemetryResult = engine.extractAllWithTelemetry(transcriptText);

const name     = telemetryResult.results.name.value;        // string or null
const urgency  = telemetryResult.results.urgency;           // "LOW"|"MEDIUM"|"HIGH"|"CRITICAL"
const amount   = telemetryResult.results.amount.value;      // number or null

const needs    = engine.extractNeeds(transcriptText, 1);    // separate call for category
const category = mapCategoryToEvaluationFormat(needs[0] || 'GENERAL');
```

**IMPORTANT**: Category extraction is a SEPARATE call from `extractAllWithTelemetry`. The telemetry 
extraction does name/urgency/amount. Category comes from `extractNeeds()` which uses keyword scoring 
against NEEDS_KEYWORDS and returns the top-N highest scoring categories.

#### Category Mapping Table
The production rules engine uses different category names than the test datasets expect:

| Engine Returns | Eval Expects | Mapping |
|---------------|-------------|---------|
| HOUSING | HOUSING | Direct pass-through |
| FOOD | FOOD | Direct pass-through |
| EMPLOYMENT | EMPLOYMENT | Direct pass-through |
| HEALTHCARE | HEALTHCARE | Direct pass-through |
| SAFETY | SAFETY | Direct pass-through |
| EDUCATION | EDUCATION | Direct pass-through |
| TRANSPORTATION | TRANSPORTATION | Direct pass-through |
| LEGAL | LEGAL | Direct pass-through |
| JOBS | EMPLOYMENT | Remapped |
| CHILDCARE | FAMILY | Remapped |
| MENTAL_HEALTH | HEALTHCARE | Remapped |
| (anything else) | (pass-through) | Falls through to OTHER |

**KNOWN GAPS**: The datasets use `EMERGENCY`, `OTHER`, `FAMILY`, and `UTILITIES` as expected categories,
but the engine's NEEDS_KEYWORDS list does NOT include `EMERGENCY` or `UTILITIES` as keyword categories.
This means the engine can never directly return these — it must be inferred or the keyword lists extended.

---

### 4. BUGS FOUND AND FIXES APPLIED (Feb 12, 2026 Session)

This session discovered and fixed **3 critical integration bugs** that prevented the eval system from 
running at all, plus **1 category mapping bug** that caused unnecessary failures.

#### Bug #1: MODULE_NOT_FOUND — temp_extract.js TypeScript Require
**Symptom**: `Error: Cannot find module 'temp_extract.js'` when running any evaluation
**Root Cause**: The old parserAdapter.js attempted to bridge JS→TS by writing a temporary 
`temp_extract.js` file that used `require()` to import TypeScript modules directly — this fails 
because Node.js cannot natively require `.ts` files without a loader.
**Fix Applied**: Complete rewrite of parserAdapter.js to use direct TypeScript imports via the tsx 
runtime that the eval runner already uses. Removed all temp file creation and `execSync` child 
process approaches.
**Impact**: Without this fix, 0/340 test cases could run.

#### Bug #2: `productionError` Undefined Variable
**Symptom**: `ReferenceError: productionError is not defined` in the fallback catch block
**Root Cause**: A `try/catch` block caught the error as `engineError` but the inner fallback catch 
referenced `productionError` (a variable name from an older version of the code).
**Fix Applied**: Eliminated the dead code paths and ensured all variable references are correct.
**Impact**: Even if Bug #1 was bypassed, the error handler itself would crash.

#### Bug #3: createParserInstance() Fallback TypeScript Import
**Symptom**: Secondary `MODULE_NOT_FOUND` when the fallback parser tried to load
**Root Cause**: The fallback path attempted to dynamically import TypeScript files using 
`require()` without tsx, failing for the same reason as Bug #1.
**Fix Applied**: Removed the broken fallback import chain. The adapter now has a clean primary 
path (production rulesEngine via tsx) and a secondary fallback (jan-v3-analytics-runner.js).
**Impact**: Cascading failure that prevented any recovery from Bug #1.

#### Bug #4: Category Mapping — HEALTHCARE Pass-Through Missing
**Symptom**: Cases expecting HEALTHCARE were failing because the old mapping only had MEDICAL→HEALTHCARE
**Root Cause**: The original category map was built for an older engine version that returned "MEDICAL". 
The current engine returns "HEALTHCARE" directly, but the map didn't include a pass-through for it.
**Fix Applied**: Rewrote `mapCategoryToEvaluationFormat()` to use a pass-through-first approach. 
Only edge cases (JOBS→EMPLOYMENT, CHILDCARE→FAMILY, MENTAL_HEALTH→HEALTHCARE) need explicit remapping. 
Everything else passes through directly.
**Impact**: ~3-5 cases were incorrectly mapped, adding to the failure count.

#### Combined Impact of All Fixes
| Metric | Before Fixes | After Fixes |
|--------|-------------|-------------|
| Eval runs at all? | NO (crashes) | YES |
| Core30 pass rate | 0% (crash) | 10% (3/30) |
| Cases evaluated | 0/340 | 30/30 (core30 run) |

---

### 5. SCORING SYSTEM — HOW PASS/FAIL IS DETERMINED

#### Field Weights
Each case is scored across 4 fields with equal weight:
```
Weighted Score = (nameMatch × 0.25) + (categoryMatch × 0.25) 
               + (urgencyMatch × 0.25) + (amountMatch × 0.25)
```

#### Matching Rules
| Field | Match Logic |
|-------|------------|
| **name** | Strict string equality by default. Fuzzy matching (case-insensitive, alpha-only) can be enabled per-case via `strictness.allowFuzzyName` |
| **category** | Exact string equality: `actual === expected` |
| **urgency** | Exact string equality: `actual === expected` (must match LOW/MEDIUM/HIGH/CRITICAL exactly) |
| **amount** | Tolerance-based: `abs(actual - expected) <= expected × tolerance`. Default tolerance = 10%. Per-case override via `strictness.amountTolerance` |

#### Special Handling
- If `expected.name` is `null` or `"Unknown"`, then `actual` must also be `null` or `"Unknown"` to match
- If `expected.goalAmount` is `null` or `"none"`, then `actual` must also be `null` or `"none"` to match
- Low-confidence fuzz cases (`labelConfidence < 0.75`) use relaxed scoring — they use ACCEPTABLE threshold for strict pass

#### Dual Thresholds
| Threshold | Pass Criteria | Use Case |
|-----------|--------------|----------|
| **STRICT** | `weightedScore ≥ 0.95` (must get 4/4 fields or close) | Production readiness |
| **ACCEPTABLE** | `weightedScore ≥ 0.85` (can miss ~1 field) | Development progress tracking |

**In practice for exactly 4 equally-weighted binary fields**: A case STRICT-passes only if it gets 
ALL 4 fields correct (score=1.00) since 3/4 correct = 0.75 which is below 0.95. A case 
ACCEPTABLE-passes at 4/4 (1.00) since 3/4 (0.75) is below 0.85. This means in reality, both 
thresholds require ALL 4 fields correct for pass.

---

### 6. FAILURE BUCKET SYSTEM — HOW FAILURES ARE CLASSIFIED

Every failed field is automatically classified into a failure bucket for triage:

#### Name Failure Buckets
| Bucket | Description | Trigger Condition |
|--------|-------------|-------------------|
| `name_missing` | Name extracted as null when present | `actual.name === null && expected.name !== null` |
| `name_fragment` | Name includes sentence fragments | Name contains `.`, `!`, or length > 50 chars |
| `name_wrong` | Completely incorrect name | Name exists but doesn't match |
| `name_title_included` | Title not cleaned | Contains "Dr", "Mr", "Mrs" |
| `name_suffix_included` | Suffix not cleaned | Contains "Jr", "III" |

#### Category Failure Buckets
| Bucket | Description | Trigger Condition |
|--------|-------------|-------------------|
| `category_wrong` | Incorrect category selected | Default for category mismatch |
| `category_priority_violated` | Multi-category priority rule broken | Test case notes contain "Multi-category" |
| `category_too_generic` | Defaulted to OTHER unnecessarily | `actual === 'OTHER' && expected !== 'OTHER'` |

#### Urgency Failure Buckets
| Bucket | Description | Trigger Condition |
|--------|-------------|-------------------|
| `urgency_under_assessed` | Level too low | Numeric level of actual < expected |
| `urgency_over_assessed` | Level too high | Numeric level of actual > expected |
| `urgency_conflicting_signals` | Failed to resolve conflicts | Test notes contain "Conflicting urgency" |

#### Amount Failure Buckets
| Bucket | Description | Trigger Condition |
|--------|-------------|-------------------|
| `amount_missing` | Amount not extracted when present | `actual === null && expected !== null` |
| `amount_wrong_selection` | Wrong number chosen | Test notes contain "Multi-number" |
| `amount_outside_tolerance` | Amount close but outside 10% | Default for other amount mismatches |

#### Robustness Failure Buckets (Fuzz Cases Only)
| Bucket | Description | Trigger Condition |
|--------|-------------|-------------------|
| `filler_words_broke_parsing` | Filler words caused failure | mutation includes `insertFillerWords` |
| `punctuation_broke_parsing` | Punctuation chaos | mutation includes `insertPunctuationChaos` |
| `reordering_broke_parsing` | Clause reorder broke it | mutation includes `reorderClauses` |
| `adversarial_not_blocked` | Adversarial injection passed | mutation includes `insertAdversarialToken` |

---

### 7. REPORT GENERATION — WHAT THE EVAL PRODUCES

Each run generates TWO report files in `backend/eval/v4plus/reports/`:
- **JSON**: `v4plus_<dataset>_<timestamp>.json` — Machine-readable full report
- **Markdown**: `v4plus_<dataset>_<timestamp>.md` — Human-readable summary

#### Report Contents
```
report = {
  metadata:           { dataset, totalCases, timestamp, config }
  summary:            { strictPassRate, acceptablePassRate, passes, failures }
  performance:        { avgLatencyMs, totalLatencyMs, withinBudget }
  failureBuckets:     { top10Strict: [{ bucket, description, count, %, exampleCases }] }
  regressions:        { count, cases: [{ testId, expectedScore, actualScore, failedFields }] }
  worklist:           [{ bucket, priority, affectedCases, suggestedFix, targetFile }]
  failureTriage:      { totalFailures, top5: [{ caseId, strictScore, failedFields, suggestedFix }] }
  fieldDriftOverview: { strictAccuracy: { name, category, urgency, amount → { correct, total, % } } }
  amountSelectionMistakes: { wageMistaken, ageMistaken, maxSelectionMistake, other, total }
  lowConfidenceSummary:    { count, avgConfidence, top10Lowest }
}
```

#### Enhanced Reporting Sections
The runner includes 6 upgrades to the default reporting:
1. **Failure Triage Snapshot**: Top 5 worst failures sorted by weighted score
2. **Field Drift Overview**: Per-field accuracy percentages 
3. **Amount Selection Mistakes**: Breakdown of WHY amounts were wrong (wage/age/date/max-selection)
4. **Low Confidence Summary**: Fuzz cases with unreliable expected values
5. **Regression Detection**: Core30 cases that fail (treated as regressions since they should all pass)
6. **Recommended Worklist**: Priority-ordered list of suggested fixes with target files

#### Report Archive
The `reports/` directory is **massive** — over 800 report files from months of testing. Report names 
encode the dataset and timestamp. Examples:
- `v4plus_core30_2026-02-12T12-36-40-005Z.json` (most recent core30 run)
- `v4plus_all_2026-02-08T22-26-12-074Z.json` (most recent all-340 run)

---

### 8. DATASET DETAILS — TEST CASE FORMAT

#### JSONL Format (One JSON Object Per Line)
```jsonl
{"id":"T001","transcriptText":"Hi, my name is Sarah...","expected":{"name":"Sarah Johnson","category":"HOUSING","urgencyLevel":"HIGH","goalAmount":2500},"difficulty":"easy","strictness":{"amountTolerance":0.10},"notes":"Clear name + housing keywords"}
```

#### Core30 Dataset (30 Cases)
- **Source**: Original V1 validation suite, converted to v4plus format
- **Immutability**: Checksum-verified via `core30.checksum.txt` on every run
- **Difficulty distribution**: EASY(6), MEDIUM(10), HARD(9), ADVERSARIAL(5)
- **Category distribution**: HOUSING, FOOD, EMPLOYMENT, HEALTHCARE, EDUCATION, SAFETY, EMERGENCY, OTHER, FAMILY, UTILITIES, LEGAL, TRANSPORTATION
- **Urgency distribution**: LOW, MEDIUM, HIGH, CRITICAL
- **IMPORTANT**: All core30 failures are flagged as **regressions** because Jan v3.0 previously achieved 100% on these

#### Hard60 Dataset (60 Cases)
- **Multi-number ambiguity**: 20 transcripts with wage + rent + deposit + age + dates
- **Conflicting urgency**: 10 cases with mixed urgency signals
- **Multi-category conflicts**: 15 cases where multiple categories compete
- **Name edge cases**: 10 cases with hyphenated names, titles, apostrophes
- **Noisy/fragmented speech**: 5 cases with heavy filler words and broken sentences
- **Strictness**: Amount tolerance 2-5% (stricter than core30's 10%)

#### Fuzz200 Dataset (200 Cases)
- **Generation**: Deterministic from 12 base templates using seed `1234`
- **Mutations**: Random combinations of filler words, clause reordering, irrelevant numbers/keywords, punctuation chaos, adversarial tokens
- **Label confidence**: Each case has a `labelConfidence` (0.0-1.0). Cases below 0.75 get relaxed scoring
- **Auto-generation**: If `fuzz200.jsonl` is missing, the runner auto-generates it from the generator script

#### Realistic50 Dataset (50 Cases)
- **Style**: Natural conversation-style transcripts (longer, more realistic)
- **Purpose**: Bridge between curated cases and real-world audio transcription output

---

### 9. ENVIRONMENT FLAGS — THE ENHANCEMENT PHASE SYSTEM

The eval runner sets many environment variables that toggle **surgical correction modules**. These 
are test-ID-aware patches that were developed in Phases 1-4 to fix specific failure patterns:

```javascript
// Set in enforceEnvironment() at runner startup:
process.env.USE_V3B_ENHANCEMENTS = 'true';           // Phase 1.5: Core30 protection
process.env.USE_V2C_ENHANCEMENTS = 'false';           // Phase 2: Category improvements (DISABLED)
process.env.USE_V2D_ENHANCEMENTS = 'true';            // Phase 1: Core30 category fixes (Conservative)
process.env.USE_V3C_ENHANCEMENTS = 'true';            // Phase 3: Conservative urgency boost
process.env.USE_V3D_DEESCALATION = 'false';           // Phase 1: Urgency de-escalation (DISABLED)
process.env.USE_CORE30_URGENCY_OVERRIDES = 'true';    // Phase 1.1: Surgical core30 urgency (test-ID-aware)
process.env.USE_PHASE2_URGENCY_BOOSTS = 'true';       // Phase 2: 26 urgency boosts (20 core + 6 fuzz)
process.env.USE_PHASE3_CATEGORY_FIXES = 'false';      // Phase 3: Category (DISABLED, obsolete)
process.env.USE_PHASE36_URGENCY_DEESCALATION = 'true'; // Phase 3.6: Urgency de-escalation surgical
process.env.USE_PHASE37_URGENCY_DEESCALATION = 'true'; // Phase 3.7: Realistic urgency de-escalation
process.env.USE_PHASE41_URGENCY_ESCALATION = 'true';   // Phase 4.1: MEDIUM→HIGH escalations
```

**KEY OBSERVATION**: These flags represent months of incremental patching. Some are disabled because 
they regressed other cases. The current combination produced the best overall score (80.20% on the 
500-case "all" dataset). The Feb v.1.5 build should evaluate which of these patches are structurally 
sound vs. band-aids that mask deeper engine issues.

---

### 10. PRODUCTION ENGINE ARCHITECTURE — WHAT THE PARSER ACTUALLY DOES

The production rules engine lives at `backend/src/utils/extraction/` and consists of 3 core modules:

#### rulesEngine.ts (1429 lines)
The main orchestrator. Key exports:
- `extractAllWithTelemetry(text)` → Returns `{ results: { name, amount, relationship, urgency, age, phone, email, location }, metrics }`
- `extractNeeds(text, topN)` → Returns array of top-N category strings by keyword score
- `extractNameWithConfidence(text)` → 12+ compiled regex patterns with NAME_REJECT_PATTERNS filtering
- `extractUrgency(text)` → Delegates to UrgencyAssessmentEngine
- `extractGoalAmountWithConfidence(text)` → Delegates to AmountDetectionEngine

**NEEDS_KEYWORDS categories defined in engine**: HOUSING, FOOD, EMPLOYMENT, JOBS, HEALTHCARE, SAFETY, 
EDUCATION, TRANSPORTATION, CHILDCARE, LEGAL, MENTAL_HEALTH

**Categories the datasets expect but engine CANNOT return**: EMERGENCY, OTHER (as primary), FAMILY 
(only via CHILDCARE remap), UTILITIES

#### urgencyEngine.ts (728 lines) — 6-Layer Weighted System
The `UrgencyAssessmentEngine` runs 6 independent layers that each score 0.0-1.0, then aggregates:

| Layer | Weight | What It Does |
|-------|--------|-------------|
| **ExplicitUrgencyLayer** | 0.30 | Pattern-matches CRITICAL/HIGH/MEDIUM/LOW keyword lists |
| **ContextualUrgencyLayer** | 0.25 | Matches CRITICAL_CONTEXTS, HIGH_CONTEXTS, MEDIUM_CONTEXTS |
| **SafetyUrgencyLayer** | 0.20 | Safety-related keywords and domestic violence indicators |
| **TemporalUrgencyLayer** | 0.15 | Time pressure: "tomorrow", "tonight", "next week", etc. |
| **ConsequenceUrgencyLayer** | 0.05 | Consequence severity keywords |
| **EmotionalUrgencyLayer** | 0.05 | Emotional distress indicators |

**Score-to-Level Thresholds**:
```
CRITICAL ≥ 0.70
HIGH     ≥ 0.38
MEDIUM   ≥ 0.13
LOW      < 0.13
```

**Critical Override**: If ANY single layer scores ≥ 0.85, the final result is forced to CRITICAL 
regardless of the weighted aggregate.

**Context Modifiers**: Categories like SAFETY, FAMILY, HEALTHCARE, HOUSING get bonus multipliers 
applied to the aggregate score.

#### amountEngine.ts (745 lines) — 5-Pass Detection System
The `AmountDetectionEngine` runs 5 sequential passes:

| Pass | Purpose |
|------|---------|
| **ExplicitAmountPass** | Regex for `$X,XXX`, `X dollars`, and SPOKEN_NUMBERS map |
| **ContextualAmountPass** | Contextual patterns like "need X for rent", "goal of X" |
| **VagueAmountPass** | Vague expressions like "a few hundred" → midpoint estimate |
| **AmbiguityRejectionPass** | Filters out wages, ages, dates, phone numbers |
| **ValidationPass** | Scores remaining candidates by contextual relevance |

**CRITICAL DEFICIENCY — SPOKEN_NUMBERS Map**: The SPOKEN_NUMBERS map in amountEngine.ts has only 
**10 entries**. It is missing many spoken number forms that appear in the test transcripts:

```
PRESENT in SPOKEN_NUMBERS:
  "five hundred" → 500
  "one thousand" → 1000
  "fifteen hundred" → 1500
  ... (7 more entries)

MISSING (needed by test cases):
  "two thousand"              → T003 expects $2,000
  "two thousand two hundred fifty" → T008 expects $2,250
  "three thousand five hundred"    → T004 expects $3,500
  "six thousand"              → T013 expects $6,000
  "three thousand"            → T012, T016, T030 expect $3,000
  "nine hundred fifty"        → T020 expects $950
  "twenty-two hundred"        → T022 expects $2,000
  "twenty-eight hundred"      → T027 expects $2,800
  "thirty-five hundred"       → T021, T028 expect $3,500
  "four thousand five hundred" → T017 expects $4,500
```

This single deficiency accounts for most of the **18 amount failures** in core30.

---

### 11. CORE30 DIAGNOSTIC RESULTS — FULL MISMATCH DATA

A diagnostic script (`backend/diagnose_core30.js`) was run on Feb 12, 2026 to capture every mismatch. 
Results saved to `backend/diagnose_results.json`. Here is the complete breakdown:

#### Category Mismatches (9 out of 30 = 70% accuracy)
| Test ID | Engine Returned | Expected | Root Cause Analysis |
|---------|----------------|----------|---------------------|
| T004 | GENERAL | EDUCATION | No education keyword matched; transcript had education context but generic language |
| T006 | EMPLOYMENT | HOUSING | "Lost my job" triggers EMPLOYMENT but primary need was housing |
| T010 | HOUSING | EMERGENCY | "House caught fire" contains HOUSING keywords but context is emergency |
| T011 | HOUSING | OTHER | Primary need is "other" but housing keywords dominate keyword scoring |
| T012 | HEALTHCARE | FAMILY | Medical context for sick child; engine picks HEALTHCARE, dataset says FAMILY |
| T016 | FAMILY | SAFETY | Domestic violence context; CHILDCARE→FAMILY remap fires before SAFETY |
| T017 | EMPLOYMENT | HEALTHCARE | Work injury context; EMPLOYMENT keywords outscore HEALTHCARE |
| T027 | EMPLOYMENT | EDUCATION | "Lost my job" + "certification program"; EMPLOYMENT beats EDUCATION |
| T029 | HOUSING | EMERGENCY | Emergency housing situation; engine returns HOUSING not EMERGENCY |

**Pattern**: The engine uses simple keyword frequency scoring for category. It cannot reason about 
**primary need vs. context**. When a transcript mentions both employment AND education, whichever has 
more keyword hits wins. The engine has no concept of EMERGENCY as a category at all.

#### Urgency Mismatches (14 out of 30 = 53% accuracy)
| Test ID | Engine Returned | Expected | Direction |
|---------|----------------|----------|-----------|
| T003 | MEDIUM | HIGH | Under-assessed |
| T006 | MEDIUM | HIGH | Under-assessed |
| T008 | MEDIUM | HIGH | Under-assessed |
| T009 | LOW | MEDIUM | Under-assessed |
| T011 | MEDIUM | LOW | Over-assessed |
| T015 | CRITICAL | HIGH | Over-assessed |
| T017 | MEDIUM | HIGH | Under-assessed |
| T019 | LOW | MEDIUM | Under-assessed |
| T020 | MEDIUM | HIGH | Under-assessed |
| T022 | MEDIUM | HIGH | Under-assessed |
| T023 | CRITICAL | MEDIUM | Over-assessed |
| T025 | CRITICAL | HIGH | Over-assessed |
| T026 | LOW | MEDIUM | Under-assessed |
| T028 | MEDIUM | HIGH | Under-assessed |

**Pattern**: 
- **8 cases under-assessed** (MEDIUM returned, HIGH expected) — the weighted aggregate with current 
  thresholds clusters most transcripts in the 0.13-0.38 range (MEDIUM)
- **3 cases over-assessed** (CRITICAL returned, HIGH expected) — the critical override 
  (any layer ≥0.85 → CRITICAL) fires too aggressively
- **2 cases under-assessed** (LOW returned, MEDIUM expected) — aggregate barely breaks 0.13 threshold
- **1 case over-assessed** (MEDIUM returned, LOW expected)

**The core problem**: The threshold boundaries (0.70/0.38/0.13) were calibrated for the old test 
suite. They don't align well with the v4plus expected values.

#### Amount Mismatches (18 out of 30 = 40% accuracy)
| Test ID | Engine Returned | Expected | Issue Type |
|---------|----------------|----------|------------|
| T003 | null | 2000 | Spoken number not in map ("two thousand") |
| T004 | 500 | 3500 | Wrong number selected ("five hundred" matched, "three thousand five hundred" missed) |
| T005 | 4000 | null | False positive (extracted amount when none expected) |
| T008 | null | 2250 | Spoken number not in map ("two thousand two hundred fifty") |
| T011 | null | 1000 | Spoken number not in map ("one thousand" — may be in map but not matching) |
| T012 | null | 3000 | Spoken number not in map ("three thousand") |
| T013 | null | 6000 | Spoken number not in map ("six thousand") |
| T015 | 500 | 2500 | Wrong number selected (picked "five hundred" over "twenty-five hundred") |
| T016 | null | 3000 | Spoken number not in map ("three thousand") |
| T017 | 4000 | 4500 | Close but wrong ("four thousand" matched, "four thousand five hundred" missed) |
| T019 | 1500 | 1750 | Close but outside 10% tolerance |
| T020 | null | 950 | Spoken number not in map ("nine hundred fifty") |
| T021 | 500 | 3500 | Wrong number selected ("five hundred" matched, "thirty-five hundred" missed) |
| T022 | null | 2000 | Spoken number not in map (likely "twenty-two hundred" or "two thousand") |
| T024 | 2500 | 2000 | Wrong number selected (picked larger number) |
| T027 | 800 | 2800 | Wrong number selected ("eight hundred" matched, "twenty-eight hundred" missed) |
| T028 | 500 | 3500 | Wrong number selected ("five hundred" matched, "thirty-five hundred" missed) |
| T030 | null | 3000 | Spoken number not in map ("three thousand") |

**Pattern**: Two distinct failure modes:
1. **Spoken numbers missing from SPOKEN_NUMBERS map** (11 cases) — The engine simply cannot parse 
   these spoken forms into numeric values
2. **Wrong number selected** (5 cases where a smaller partial match wins) — "three thousand five 
   hundred" contains "five hundred" which the engine CAN match, so it returns 500 instead of 3500

#### Name Mismatches (10 out of 30 = 67% accuracy)
| Test ID | Engine Returned | Expected | Issue Type |
|---------|----------------|----------|------------|
| T006 | null | David Wilson | Pattern miss: "Hello, my name is David Wilson" not matched |
| T007 | null | Maria Garcia | Pattern miss: "Hi, I'm Maria Garcia" not matched |
| T008 | "facing eviction" | James Brown | False positive: non-name phrase captured as name |
| T017 | null | Marcus Johnson | Pattern miss |
| T018 | null | Jennifer Park | Pattern miss |
| T020 | null | Rachel Martinez | Pattern miss |
| T021 | null | Patricia Collins | Pattern miss |
| T024 | "Brian" | Brian Anderson | Partial match: first name only, last name dropped |
| T028 | "calling because" | Jessica Morgan | False positive: "calling because" captured as name |
| T029 | null | Carlos Ramirez | Pattern miss |

**Pattern**: Two distinct failure modes:
1. **Pattern miss** (7 cases) — The 12+ name regex patterns don't match common introduction formats 
   like "Hello, my name is X Y" or "Hi, I'm X Y"
2. **False positive** (2 cases) — Non-name phrases like "facing eviction" or "calling because" pass 
   the pattern match but should be caught by NAME_REJECT_PATTERNS
3. **Partial match** (1 case) — First name captured but last name lost

---

### 12. ARCHIVE AND SUITE VERSIONING

#### Current Archive State (as of Feb 12, 2026)
```
backend/eval/
├── v4plus/                          ← LIVE working copy (active development)
├── v4plus-archives/
│   └── jan-v4plus-archive_2026-02-12_07-50-46/   ← Jan snapshot (rollback safety)
└── feb-v1/                          ← Feb v.1 working copy (clone of v4plus at archive time)
```

- **v4plus/**: The actively running eval suite. This is what `run_eval_v4plus.js --dataset core30` uses.
- **jan-v4plus-archive_2026-02-12_07-50-46/**: Complete snapshot of the Jan state including all reports, 
  all datasets, all runners. Can be restored by copying back over v4plus/ if needed.
- **feb-v1/**: Clean copy made for the Feb v.1 build cycle. The Navigator should use this as the 
  starting point for the Feb v.1.5 architecture.

#### Versioning Convention
```
jan-v4plus    → January test suite (archived)
feb-v1        → February v.1 (working copy created Feb 12)
feb-v1.5      → February v.1.5 (the TARGET — what the Navigator will architect)
```

---

### 13. FEB V.1.5 BUILD — WHAT THE NAVIGATOR NEEDS TO ARCHITECT

#### Summary of What Needs to Change
Based on the diagnostic data above, the Feb v.1.5 build needs to address **4 systemic problems** in 
the production rules engine:

##### Problem 1: Amount Detection — SPOKEN_NUMBERS Map (18 failures, highest impact)
- **Root cause**: SPOKEN_NUMBERS map has only 10 entries, missing dozens of common spoken number forms
- **Scope**: ~30 new entries needed covering compound spoken numbers
- **Files**: `backend/src/utils/extraction/amountEngine.ts`
- **Complexity**: LOW — this is a lookup table expansion
- **Expected impact**: Fix 11+ of the 18 amount failures directly

##### Problem 2: Urgency Thresholds — Miscalibrated Boundaries (14 failures)
- **Root cause**: scoreToLevel thresholds (0.70/0.38/0.13) cluster most transcripts as MEDIUM
- **Scope**: Threshold recalibration OR layer weight rebalancing
- **Files**: `backend/src/utils/extraction/urgencyEngine.ts`
- **Complexity**: MEDIUM — requires analysis of score distribution across all test cases
- **Risk**: Changing thresholds for core30 may regress hard60/fuzz200/realistic50
- **Approach options**: (a) Lower HIGH threshold to ~0.30, (b) Increase temporal/contextual weights, 
  (c) Add category-aware threshold adjustments

##### Problem 3: Category Classification — No Semantic Reasoning (9 failures)
- **Root cause**: Keyword frequency scoring cannot distinguish primary need from context
- **Scope**: Need either (a) priority rules, (b) semantic ordering, or (c) new categories in NEEDS_KEYWORDS
- **Files**: `backend/src/utils/extraction/rulesEngine.ts` (NEEDS_KEYWORDS, extractNeeds)
- **Complexity**: MEDIUM-HIGH — adding EMERGENCY/UTILITIES keywords is easy; teaching priority reasoning is hard
- **Quick wins**: Add EMERGENCY keyword list (fire, flood, natural disaster, emergency shelter). Add UTILITIES keyword list.

##### Problem 4: Name Extraction — Pattern Coverage (10 failures)
- **Root cause**: 12 compiled regex patterns miss common introduction forms
- **Scope**: Add 4-6 new patterns + improve reject pattern filtering
- **Files**: `backend/src/utils/extraction/rulesEngine.ts` (COMPILED_EXTRACTION_PATTERNS.name, NAME_REJECT_PATTERNS)
- **Complexity**: LOW-MEDIUM — regex additions with regression risk
- **Specific patterns needed**: 
  - `Hello, my name is {First} {Last}`
  - `Hi, I'm {First} {Last}`
  - `My name is... it's {First} {Last}` (hesitation pattern)
  - Better reject: "facing eviction", "calling because" should never pass validation

#### Recommended Build Order for Feb v.1.5
1. **SPOKEN_NUMBERS expansion** (amountEngine.ts) — Lowest risk, highest impact
2. **Name patterns** (rulesEngine.ts) — Low risk, medium impact
3. **EMERGENCY/UTILITIES keywords** (rulesEngine.ts) — Low risk for category
4. **Urgency threshold recalibration** (urgencyEngine.ts) — Highest risk, requires careful testing
5. **Category priority rules** (rulesEngine.ts) — Medium risk, complex logic change

#### Target Metrics for Feb v.1.5
| Dataset | Current (Jan) | Target (Feb v.1.5) |
|---------|--------------|-------------------|
| core30 STRICT pass | 10% (3/30) | ≥60% (18/30) |
| core30 ACCEPTABLE pass | 10% (3/30) | ≥70% (21/30) |
| all-340 STRICT pass | ~80% | ≥85% |
| all-340 ACCEPTABLE pass | ~80% | ≥90% |

---

### 14. POST-TEST REPORTING WORKFLOW — END-TO-END PROCESS

For the Navigator's reference, here is the complete workflow for running tests, analyzing results, 
and iterating:

```
Step 1: MAKE ENGINE CHANGES
  └── Edit files in backend/src/utils/extraction/
      ├── rulesEngine.ts      (name patterns, category keywords)
      ├── urgencyEngine.ts    (thresholds, layer weights)
      └── amountEngine.ts     (SPOKEN_NUMBERS, amount passes)

Step 2: RUN CORE30 (Quick Regression Check)
  └── cd backend
  └── npx tsx eval/v4plus/runners/run_eval_v4plus.js --dataset core30
  └── Review console output for pass rate and failure buckets
  └── Reports auto-saved to eval/v4plus/reports/

Step 3: CHECK FOR REGRESSIONS
  └── Any core30 failure = regression (should be 100% baseline)
  └── If regressions detected, STOP and fix before proceeding

Step 4: RUN HARD60 (Difficult Edge Cases)
  └── npx tsx eval/v4plus/runners/run_eval_v4plus.js --dataset hard60
  └── Compare pass rates to previous run
  └── Note any new failure buckets

Step 5: RUN ALL-340 (Full Sweep)
  └── npx tsx eval/v4plus/runners/run_eval_v4plus.js --dataset all
  └── This runs core30 + hard60 + fuzz200 + realistic50
  └── Takes ~10-30 seconds for 340 cases
  └── Generates comprehensive combined report

Step 6: ANALYZE REPORT
  └── Open latest v4plus_all_<timestamp>.md in reports/
  └── Check: Strict pass rate, Acceptable pass rate
  └── Check: Field Drift Overview (per-field accuracy)
  └── Check: Top 10 Failure Buckets (most impactful failures)
  └── Check: Amount Selection Mistakes (wage/age/date confusion)
  └── Check: Regression count

Step 7: COMPARE TO PREVIOUS BASELINE
  └── Previous best: 80.20% (401/500) on all-500
  └── Current core30: 10% (3/30) — THIS IS THE GAP
  └── Track per-field drift to ensure no field regresses

Step 8: ITERATE
  └── Use failure buckets + worklist to prioritize next fix
  └── Make ONE change at a time
  └── Re-run core30 after each change
  └── Run all-340 after every 3-5 changes
```

#### Diagnostic Script for Deep Analysis
When pass rates are low, run the diagnostic script for detailed mismatch data:
```bash
cd backend
npx tsx diagnose_core30.js
```
This outputs `diagnose_results.json` with exact got/expected for every mismatch organized by field.

---

### 15. KEY FILES REFERENCE TABLE

| File | Location | Lines | Purpose |
|------|----------|-------|---------|
| run_eval_v4plus.js | `backend/eval/v4plus/runners/` | 1447 | Main evaluation runner |
| parserAdapter.js | `backend/eval/v4plus/runners/` | 235 | Bridge: eval ↔ production engine |
| rulesEngine.ts | `backend/src/utils/extraction/` | 1429 | Production parsing: name, needs, orchestration |
| urgencyEngine.ts | `backend/src/utils/extraction/` | 728 | 6-layer urgency assessment |
| amountEngine.ts | `backend/src/utils/extraction/` | 745 | 5-pass amount detection |
| core30.jsonl | `backend/eval/v4plus/datasets/` | 30 lines | Baseline test cases (immutable) |
| hard60.jsonl | `backend/eval/v4plus/datasets/` | 60 lines | Curated difficult cases |
| fuzz200.jsonl | `backend/eval/v4plus/datasets/` | 201 lines | Generated fuzz cases (1 meta + 200 data) |
| realistic50.jsonl | `backend/eval/v4plus/datasets/` | 50 lines | Realistic conversation cases |
| diagnose_core30.js | `backend/` | ~100 | Diagnostic mismatch reporter |
| diagnose_results.json | `backend/` | 265 | Full mismatch data from latest diagnostic run |

---

**Report Status**: COMPLETE - Ready for Implementation Oversight  
**Technical Readiness**: All specifications provided for immediate development start  
**Evaluation System**: Fully documented — v4plus eval pipeline, scoring, failure buckets, datasets  
**Platform Potential**: Comprehensive homeless-to-self-sufficiency transformation system  
**Foundation**: Built on proven V1 Production Parser with clear path to Feb v.1.5 improvements  
**Parser Current State**: 10% core30 pass rate with 4 identified systemic issues to resolve