# 🏗️ HOMELESS-TO-SELF-FUNDED PROGRESSION STAGES SYSTEM
## Technical Implementation & Validation Framework

### 🎯 Stage Progression Engine

#### Core Stage Configuration
```javascript
// backend/src/services/stages/stageDefinitions.js
const PROGRESSION_STAGES = {
  1: {
    name: "Crisis Stabilization",
    duration: { min: 7, target: 30, max: 60 }, // days
    priority: "critical",
    color: "#FF4444",
    icon: "🚨",
    description: "Immediate safety and basic needs",
    objectives: [
      "Secure safe shelter for 7+ consecutive days",
      "Establish regular food access",
      "Address immediate medical emergencies", 
      "Obtain basic identification documents",
      "Connect with emergency services"
    ],
    criteria: {
      housing: {
        type: "temporary_safe",
        duration_days: 7,
        verification_required: true
      },
      documentation: {
        id_obtained: true,
        benefits_applied: true
      },
      health: {
        emergencies_addressed: true,
        basic_care_access: true
      },
      support: {
        case_worker_assigned: true,
        emergency_contacts: ">=1"
      }
    },
    resources: [
      "Emergency shelter listings",
      "Food bank locations", 
      "Free clinic directory",
      "Document replacement guides",
      "Crisis hotline numbers"
    ],
    funding_categories: [
      "emergency_shelter",
      "immediate_food",
      "medical_emergency",
      "document_replacement",
      "transportation_emergency"
    ]
  },
  
  2: {
    name: "Foundation Building", 
    duration: { min: 30, target: 90, max: 120 },
    priority: "high",
    color: "#FF8800",
    icon: "🏗️",
    description: "Establish basic stability and support systems",
    objectives: [
      "Secure stable temporary housing (90+ days)",
      "Establish healthcare provider relationship",
      "Optimize benefit programs and assistance",
      "Complete basic life skills assessment",
      "Build initial support network connections"
    ],
    criteria: {
      housing: {
        type: "transitional_stable",
        duration_days: 90,
        lease_or_agreement: true
      },
      income: {
        benefits_active: true,
        monthly_amount: ">=800", // or local minimum
        payment_reliability: ">= 80%"
      },
      health: {
        primary_care_provider: true,
        regular_checkups_scheduled: true,
        medication_management: true
      },
      support: {
        professional_contacts: ">=2",
        peer_connections: ">=1",
        regular_check_ins: true
      }
    },
    resources: [
      "Transitional housing programs",
      "Healthcare enrollment assistance",
      "Benefits optimization tools",
      "Life skills workshops",
      "Support group directories"
    ],
    funding_categories: [
      "transitional_housing",
      "healthcare_enrollment",
      "basic_skills_training",
      "support_services",
      "stability_maintenance"
    ]
  },

  3: {
    name: "Skill Development",
    duration: { min: 90, target: 180, max: 270 },
    priority: "medium-high", 
    color: "#FFBB00",
    icon: "📚",
    description: "Build employability and independence skills",
    objectives: [
      "Enroll in relevant education/training program",
      "Complete job readiness preparation", 
      "Learn financial literacy fundamentals",
      "Develop digital/computer skills",
      "Build professional network connections"
    ],
    criteria: {
      education: {
        program_enrolled: true,
        attendance_rate: ">=75%",
        progress_percentage: ">=50%"
      },
      skills: {
        job_readiness_completed: true,
        financial_literacy_basic: true,
        digital_skills_basic: true,
        resume_professional: true
      },
      network: {
        professional_references: ">=2",
        industry_connections: ">=3",
        mentor_relationship: true
      },
      preparation: {
        interview_skills_practiced: true,
        workplace_readiness_assessed: true
      }
    },
    resources: [
      "Training program database",
      "Job readiness workshops", 
      "Financial education courses",
      "Digital literacy programs",
      "Professional networking events"
    ],
    funding_categories: [
      "education_training",
      "skill_development",
      "professional_tools",
      "networking_events",
      "certification_exams"
    ]
  },

  4: {
    name: "Employment Transition",
    duration: { min: 60, target: 120, max: 180 },
    priority: "high",
    color: "#88CC00", 
    icon: "💼",
    description: "Secure sustainable employment",
    objectives: [
      "Actively search and apply for suitable positions",
      "Complete interview preparation and practice",
      "Acquire work-appropriate clothing and equipment", 
      "Establish reliable transportation to work",
      "Develop workplace mentorship relationships"
    ],
    criteria: {
      employment: {
        job_secured: true,
        hours_per_week: ">=30",
        wage_rate: ">=local_living_wage",
        employment_duration: ">=30_days"
      },
      preparation: {
        interview_skills_demonstrated: true,
        professional_wardrobe_adequate: true,
        transportation_reliable: true
      },
      performance: {
        attendance_rate: ">=95%",
        performance_meeting_standards: true,
        coworker_integration: true
      },
      support: {
        workplace_mentor: true,
        employment_counselor_contact: true
      }
    },
    resources: [
      "Job placement services",
      "Interview coaching",
      "Professional clothing assistance",
      "Transportation solutions",  
      "Workplace mentorship programs"
    ],
    funding_categories: [
      "job_placement_support",
      "professional_wardrobe",
      "transportation_assistance", 
      "work_equipment_tools",
      "employment_coaching"
    ]
  },

  5: {
    name: "Housing Independence",
    duration: { min: 90, target: 180, max: 270 },
    priority: "medium-high",
    color: "#00CC44",
    icon: "🏠", 
    description: "Transition to independent housing", 
    objectives: [
      "Repair and build credit score",
      "Establish positive rental history",
      "Save for security deposits and moving costs",
      "Learn household setup and management",
      "Understand lease agreements and tenant rights"
    ],
    criteria: {
      housing: {
        independent_lease_secured: true,
        rent_payment_history: ">=3_months_current",
        lease_understanding_demonstrated: true
      },
      financial: {
        credit_score: ">=600",
        security_deposit_saved: true,
        first_month_rent_available: true,
        moving_costs_covered: true
      },
      management: {
        household_budget_maintained: true,
        utilities_management_demonstrated: true,
        maintenance_responsibilities_understood: true
      },
      preparedness: {
        emergency_plan_created: true,
        tenant_rights_education_completed: true
      }
    },
    resources: [
      "Credit repair services",
      "Rental assistance programs", 
      "Housing search tools",
      "Tenant education workshops",
      "Household management courses"
    ],
    funding_categories: [
      "security_deposit_assistance",
      "first_month_rent",
      "moving_expenses",
      "household_essentials",
      "utility_setup_costs"
    ]
  },

  6: {
    name: "Financial Sustainability", 
    duration: { min: 120, target: 240, max: 360 },
    priority: "medium",
    color: "#0088CC",
    icon: "💰",
    description: "Build long-term financial security",
    objectives: [
      "Develop 3-month emergency fund",
      "Manage and eliminate outstanding debts",  
      "Improve credit score significantly", 
      "Learn investment and retirement basics",
      "Complete advanced financial education"
    ],
    criteria: {
      emergency_fund: {
        amount_saved: ">=3_months_expenses", 
        separate_account_maintained: true,
        automatic_contributions: true
      },
      debt_management: {
        debt_reduction_plan: true,
        payment_history: ">=95%_on_time",
        overall_debt_decreased: ">=50%"
      },
      credit: {
        score_improvement: ">=100_points",
        credit_utilization: "<=30%",
        no_new_negative_marks: true
      },
      planning: {
        retirement_account_opened: true,
        investment_basics_completed: true,
        long_term_financial_plan: true
      }
    },
    resources: [
      "Financial planning services",
      "Debt counseling programs",
      "Investment education courses", 
      "Credit monitoring tools",
      "Advanced budgeting workshops"
    ],
    funding_categories: [
      "emergency_fund_building",
      "debt_elimination_support",
      "financial_education_advanced",
      "investment_starter_funds",
      "credit_monitoring_services"
    ]
  },

  7: {
    name: "Self-Sufficiency & Community Leadership",
    duration: { min: 180, target: 365, max: null }, // ongoing
    priority: "low-medium",
    color: "#4400CC",
    icon: "🌟",
    description: "Complete independence and community contribution",
    objectives: [
      "Advance career with increased responsibilities/income",
      "Explore homeownership opportunities",
      "Engage in community involvement and leadership",
      "Mentor others in similar situations", 
      "Share skills and expertise with community"
    ],
    criteria: {
      career: {
        income_growth: ">=20%_from_stage4",
        career_advancement: true,
        professional_development_ongoing: true,
        leadership_responsibilities: true
      },
      financial: {
        homeownership_ready: true, // or stable long-term rental
        retirement_contributions_regular: true,
        financial_independence_demonstrated: true
      },
      community: {
        volunteer_activities: ">=quarterly", 
        mentorship_provided: ">=1_person",
        community_leadership_role: true,
        skills_sharing_active: true
      },
      impact: {
        others_helped_transition: ">=1",
        community_contribution_documented: true,
        personal_growth_demonstrated: true
      }
    },
    resources: [
      "Career advancement programs",
      "Homeownership education",
      "Community leadership opportunities",
      "Mentorship training programs", 
      "Skills sharing platforms"
    ],
    funding_categories: [
      "career_advancement_support",
      "homeownership_preparation", 
      "community_project_funding",
      "mentorship_program_support",
      "leadership_development"
    ]
  }
};

module.exports = { PROGRESSION_STAGES };
```

#### Stage Validation Engine
```javascript
// backend/src/services/stages/stageValidator.js
const { PROGRESSION_STAGES } = require('./stageDefinitions');

class StageValidator {
  
  /**
   * Validate if user meets criteria for stage advancement
   * @param {Object} userData - User profile data
   * @param {number} currentStage - Current stage number
   * @returns {Object} Validation results
   */
  async validateStageAdvancement(userData, currentStage) {
    const nextStage = currentStage + 1;
    
    if (!PROGRESSION_STAGES[nextStage]) {
      return { 
        canAdvance: false, 
        reason: "Already at maximum stage" 
      };
    }

    const currentCriteria = PROGRESSION_STAGES[currentStage].criteria;
    const validationResults = {};
    let allCriteriaMet = true;
    let totalCriteria = 0;
    let metCriteria = 0;

    // Validate each criteria category
    for (const [category, requirements] of Object.entries(currentCriteria)) {
      validationResults[category] = {};
      
      for (const [requirement, expected] of Object.entries(requirements)) {
        totalCriteria++;
        const actual = this.getUserDataValue(userData, category, requirement);
        const isMet = this.evaluateCriteria(actual, expected);
        
        validationResults[category][requirement] = {
          expected,
          actual,
          met: isMet,
          score: isMet ? 1 : 0
        };

        if (isMet) metCriteria++;
        else allCriteriaMet = false;
      }
    }

    const completionPercentage = (metCriteria / totalCriteria) * 100;
    
    return {
      canAdvance: allCriteriaMet,
      currentStage,
      nextStage: allCriteriaMet ? nextStage : null,
      completionPercentage,
      totalCriteria,
      metCriteria,
      validationResults,
      recommendations: this.generateRecommendations(validationResults)
    };
  }

  /**
   * Extract user data value by category and field
   */
  getUserDataValue(userData, category, field) {
    return userData?.[category]?.[field] || userData?.profile_data?.[category]?.[field] || null;
  }

  /**
   * Evaluate if actual value meets expected criteria
   */
  evaluateCriteria(actual, expected) {
    if (typeof expected === 'boolean') {
      return actual === expected;
    }
    
    if (typeof expected === 'string') {
      if (expected.startsWith('>=')) {
        const threshold = parseFloat(expected.substring(2));
        return parseFloat(actual) >= threshold;
      }
      if (expected.startsWith('<=')) {
        const threshold = parseFloat(expected.substring(2));
        return parseFloat(actual) <= threshold;
      }
      if (expected.includes('_days')) {
        const targetDays = parseInt(expected.split('_')[0]);
        return this.validateDuration(actual, targetDays);
      }
      return actual === expected;
    }
    
    if (typeof expected === 'number') {
      return actual >= expected;
    }
    
    return false;
  }

  /**
   * Generate actionable recommendations for unmet criteria
   */
  generateRecommendations(validationResults) {
    const recommendations = [];
    
    for (const [category, requirements] of Object.entries(validationResults)) {
      for (const [requirement, result] of Object.entries(requirements)) {
        if (!result.met) {
          const recommendation = this.generateSpecificRecommendation(category, requirement, result);
          if (recommendation) {
            recommendations.push(recommendation);
          }
        }
      }
    }
    
    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Generate specific actionable recommendation
   */
  generateSpecificRecommendation(category, requirement, result) {
    const recommendations = {
      housing: {
        duration_days: {
          action: "Maintain stable housing",
          description: `Continue current housing arrangement for ${result.expected - (result.actual || 0)} more days`,
          priority: 9,
          category: "housing",
          timeframe: "immediate"
        }
      },
      employment: {
        job_secured: {
          action: "Secure employment",
          description: "Apply for positions matching your skills and complete interview processes",
          priority: 10,
          category: "employment", 
          timeframe: "2-4 weeks"
        }
      },
      financial: {
        emergency_fund: {
          action: "Build emergency savings",
          description: `Save $${result.expected - (result.actual || 0)} more for 3-month emergency fund`,
          priority: 8,
          category: "financial",
          timeframe: "3-6 months"
        }
      }
    };

    return recommendations[category]?.[requirement] || {
      action: `Complete ${requirement}`,
      description: `Work on meeting the requirement: ${result.expected}`,
      priority: 5,
      category,
      timeframe: "varies"
    };
  }

  /**
   * Validate duration-based criteria
   */
  validateDuration(actualDate, requiredDays) {
    if (!actualDate) return false;
    
    const startDate = new Date(actualDate);
    const currentDate = new Date();
    const daysDifference = (currentDate - startDate) / (1000 * 60 * 60 * 24);
    
    return daysDifference >= requiredDays;
  }
}

module.exports = StageValidator;
```

#### Stage Management API
```javascript
// backend/src/routes/stages.js
const express = require('express');
const router = express.Router();
const StageValidator = require('../services/stages/stageValidator');
const { PROGRESSION_STAGES } = require('../services/stages/stageDefinitions');

const stageValidator = new StageValidator();

/**
 * GET /api/stages/current/:userId
 * Get user's current stage information
 */
router.get('/current/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await getUserProfile(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentStage = user.current_stage || 1;  
    const stageInfo = PROGRESSION_STAGES[currentStage];
    
    res.json({
      user_id: userId,
      current_stage: currentStage,
      stage_info: stageInfo,
      stage_start_date: user.stage_start_date,
      time_in_stage: calculateTimeInStage(user.stage_start_date)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/stages/validate/:userId
 * Validate user's readiness for stage advancement
 */
router.post('/validate/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await getUserProfile(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validation = await stageValidator.validateStageAdvancement(
      user, 
      user.current_stage || 1
    );
    
    res.json(validation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/stages/advance/:userId  
 * Advance user to next stage (if criteria met)
 */
router.post('/advance/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await getUserProfile(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validation = await stageValidator.validateStageAdvancement(
      user,
      user.current_stage || 1  
    );

    if (!validation.canAdvance) {
      return res.status(400).json({
        error: 'Advancement criteria not met',
        validation
      });
    }

    // Record stage progression
    await recordStageProgression(userId, user.current_stage, validation.nextStage);
    
    // Update user's current stage
    await updateUserStage(userId, validation.nextStage);
    
    res.json({
      success: true,
      previous_stage: user.current_stage,
      new_stage: validation.nextStage,
      advanced_at: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/stages/dashboard/:userId
 * Get comprehensive dashboard data for user's stage progress
 */
router.get('/dashboard/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await getUserProfile(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentStage = user.current_stage || 1;
    const validation = await stageValidator.validateStageAdvancement(user, currentStage);
    const stageHistory = await getStageHistory(userId);
    const activeCampaigns = await getUserCampaigns(userId);
    
    res.json({
      user_profile: user,
      current_stage_info: PROGRESSION_STAGES[currentStage], 
      advancement_readiness: validation,
      stage_history: stageHistory,
      active_campaigns: activeCampaigns,
      overall_progress: calculateOverallProgress(currentStage, validation.completionPercentage)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 📊 Progress Tracking & Analytics

#### User Progress Calculator
```javascript
// backend/src/services/stages/progressCalculator.js
class ProgressCalculator {
  
  /**
   * Calculate overall platform progress (0-100%)
   */
  calculateOverallProgress(currentStage, stageCompletionPercentage) {
    const totalStages = Object.keys(PROGRESSION_STAGES).length;
    const stagesCompleted = currentStage - 1;
    const currentStageProgress = stageCompletionPercentage / 100;
    
    return ((stagesCompleted + currentStageProgress) / totalStages) * 100;
  }

  /**
   * Estimate time to self-sufficiency based on current progress
   */
  estimateTimeToCompletion(currentStage, stageCompletionPercentage, averageStageCompletionTime) {
    const remainingStages = Object.keys(PROGRESSION_STAGES).length - currentStage;
    const currentStageRemainingTime = this.estimateCurrentStageRemainingTime(
      currentStage, 
      stageCompletionPercentage
    );
    
    return currentStageRemainingTime + (remainingStages * averageStageCompletionTime);
  }

  /**
   * Generate milestone achievements timeline
   */
  generateMilestoneTimeline(userId) {
    // Implementation for tracking and displaying user achievements over time
  }
}
```

---

**Implementation Priority**: High - Core platform functionality
**Next Steps**: Database migration scripts and API endpoint testing
**Integration**: Ready for frontend dashboard development