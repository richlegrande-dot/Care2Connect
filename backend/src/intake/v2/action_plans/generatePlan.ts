/**
 * V2 Action Plan Generator — Deterministic Task Library
 *
 * Generates a 3-horizon action plan based on intake responses:
 *   - Immediate (0–24 hours): Crisis stabilization, safety
 *   - Short-term (1–7 days): Service connection, documentation
 *   - Medium-term (30–90 days): Stability building, goal work
 *
 * Tasks are selected from a static library using trigger conditions
 * matched against intake data. No AI calls.
 *
 * @module intake/v2/action_plans
 */

import type { IntakeData } from '../scoring/computeScores';

// ── Types ──────────────────────────────────────────────────────

export type Horizon = 'immediate' | 'short_term' | 'medium_term';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface ActionTask {
  id: string;
  horizon: Horizon;
  category: string;
  title: string;
  description: string;
  priority: TaskPriority;
  resourceTypes: string[];
}

export interface ActionPlanResult {
  immediateTasks: ActionTask[];
  shortTermTasks: ActionTask[];
  mediumTermTasks: ActionTask[];
  generatedAt: string;
  taskCount: number;
}

interface TaskTemplate {
  id: string;
  horizon: Horizon;
  category: string;
  title: string;
  description: string;
  priority: TaskPriority;
  resourceTypes: string[];
  triggers: TriggerCondition[];
}

interface TriggerCondition {
  /** Dot-path into IntakeData, e.g. "safety.fleeing_dv" */
  field: string;
  operator: 'eq' | 'neq' | 'in' | 'gte' | 'lte' | 'exists' | 'includes';
  value: unknown;
}

// ── Task Library ───────────────────────────────────────────────

const TASK_LIBRARY: TaskTemplate[] = [
  // ── IMMEDIATE (0–24h) ──────────────────────────────────────

  {
    id: 'imm-dv-hotline',
    horizon: 'immediate',
    category: 'safety',
    title: 'Contact DV hotline & secure DV shelter bed',
    description: 'Call the National Domestic Violence Hotline (1-800-799-7233) or local DV shelter for immediate safe placement.',
    priority: 'critical',
    resourceTypes: ['dv_shelter', 'crisis_hotline'],
    triggers: [{ field: 'safety.fleeing_dv', operator: 'eq', value: true }],
  },
  {
    id: 'imm-trafficking-hotline',
    horizon: 'immediate',
    category: 'safety',
    title: 'Contact trafficking hotline',
    description: 'Call the National Human Trafficking Hotline (1-888-373-7888) for immediate assistance.',
    priority: 'critical',
    resourceTypes: ['crisis_hotline', 'legal_aid'],
    triggers: [{ field: 'safety.fleeing_trafficking', operator: 'eq', value: true }],
  },
  {
    id: 'imm-crisis-counselor',
    horizon: 'immediate',
    category: 'mental_health',
    title: 'Crisis counselor referral — 988 Suicide & Crisis Lifeline',
    description: 'Connect with a crisis counselor immediately. Call or text 988.',
    priority: 'critical',
    resourceTypes: ['crisis_hotline', 'mental_health'],
    triggers: [{ field: 'safety.suicidal_ideation_recent', operator: 'eq', value: true }],
  },
  {
    id: 'imm-shelter-bed',
    horizon: 'immediate',
    category: 'housing',
    title: 'Identify nearest shelter with available beds',
    description: 'Search for emergency shelter availability in the client\'s area.',
    priority: 'critical',
    resourceTypes: ['shelter'],
    triggers: [{ field: 'housing.current_living_situation', operator: 'eq', value: 'unsheltered' }],
  },
  {
    id: 'imm-medical-attention',
    horizon: 'immediate',
    category: 'health',
    title: 'Arrange immediate medical attention',
    description: 'Connect with nearest emergency room, urgent care, or mobile health unit.',
    priority: 'critical',
    resourceTypes: ['healthcare', 'emergency_services'],
    triggers: [{ field: 'health.needs_immediate_medical', operator: 'eq', value: true }],
  },
  {
    id: 'imm-medication-access',
    horizon: 'immediate',
    category: 'health',
    title: 'Arrange emergency medication access',
    description: 'Contact pharmacy assistance programs or community health center for emergency medication supply.',
    priority: 'high',
    resourceTypes: ['healthcare', 'pharmacy'],
    triggers: [
      { field: 'health.needs_medication', operator: 'eq', value: true },
      { field: 'health.has_access_to_medication', operator: 'eq', value: false },
    ],
  },
  {
    id: 'imm-violence-safety-plan',
    horizon: 'immediate',
    category: 'safety',
    title: 'Create personal safety plan',
    description: 'Work with case manager to develop an immediate safety plan addressing current threats.',
    priority: 'high',
    resourceTypes: ['case_management'],
    triggers: [{ field: 'safety.experienced_violence_recently', operator: 'eq', value: true }],
  },
  {
    id: 'imm-mental-health-crisis',
    horizon: 'immediate',
    category: 'mental_health',
    title: 'Connect with mental health crisis services',
    description: 'Arrange crisis intervention or emergency psychiatric evaluation.',
    priority: 'critical',
    resourceTypes: ['mental_health', 'crisis_hotline'],
    triggers: [{ field: 'safety.mental_health_current', operator: 'eq', value: 'severe_crisis' }],
  },

  // ── SHORT-TERM (1–7 days) ──────────────────────────────────

  {
    id: 'st-obtain-id',
    horizon: 'short_term',
    category: 'documentation',
    title: 'Assist with obtaining state ID / birth certificate',
    description: 'Help navigate DMV requirements and fee waiver programs for obtaining government-issued ID.',
    priority: 'high',
    resourceTypes: ['legal_aid', 'case_management'],
    triggers: [{ field: 'income.has_valid_id', operator: 'eq', value: false }],
  },
  {
    id: 'st-health-insurance',
    horizon: 'short_term',
    category: 'health',
    title: 'Screen for Medicaid / marketplace insurance eligibility',
    description: 'Complete Medicaid application or explore marketplace options during open enrollment.',
    priority: 'high',
    resourceTypes: ['healthcare', 'benefits_enrollment'],
    triggers: [{ field: 'health.has_health_insurance', operator: 'eq', value: false }],
  },
  {
    id: 'st-income-benefits',
    horizon: 'short_term',
    category: 'income',
    title: 'Screen for SSI/SSDI, SNAP, TANF benefits',
    description: 'Complete benefits screening and assist with applications for eligible programs.',
    priority: 'high',
    resourceTypes: ['benefits_enrollment', 'case_management'],
    triggers: [{ field: 'income.has_any_income', operator: 'eq', value: false }],
  },
  {
    id: 'st-substance-treatment',
    horizon: 'short_term',
    category: 'substance_use',
    title: 'Connect with substance use treatment program',
    description: 'Identify and refer to appropriate treatment program (outpatient, inpatient, MAT).',
    priority: 'high',
    resourceTypes: ['substance_treatment', 'mental_health'],
    triggers: [{ field: 'safety.substance_use_current', operator: 'eq', value: 'seeking_treatment' }],
  },
  {
    id: 'st-eviction-legal',
    horizon: 'short_term',
    category: 'legal',
    title: 'Connect with eviction prevention legal aid',
    description: 'Refer to legal aid for eviction defense, tenant rights, or emergency rental assistance.',
    priority: 'high',
    resourceTypes: ['legal_aid', 'financial_assistance'],
    triggers: [{ field: 'housing.eviction_notice', operator: 'eq', value: true }],
  },
  {
    id: 'st-veteran-services',
    horizon: 'short_term',
    category: 'veterans',
    title: 'Connect with VA services and veteran-specific programs',
    description: 'Contact local VA office, SSVF program, or HUD-VASH for veteran-specific housing and services.',
    priority: 'high',
    resourceTypes: ['veterans_services', 'housing'],
    triggers: [{ field: 'demographics.veteran_status', operator: 'eq', value: true }],
  },
  {
    id: 'st-prenatal-care',
    horizon: 'short_term',
    category: 'health',
    title: 'Arrange prenatal care',
    description: 'Connect with OB/GYN services, WIC program, and prenatal nutrition support.',
    priority: 'high',
    resourceTypes: ['healthcare', 'wic'],
    triggers: [{ field: 'health.currently_pregnant', operator: 'eq', value: true }],
  },
  {
    id: 'st-food-assistance',
    horizon: 'short_term',
    category: 'food',
    title: 'Connect with food assistance programs',
    description: 'Identify food banks, community meals, SNAP enrollment, and other food assistance.',
    priority: 'medium',
    resourceTypes: ['food', 'benefits_enrollment'],
    triggers: [{ field: 'goals.top_priorities', operator: 'includes', value: 'food' }],
  },

  // ── MEDIUM-TERM (30–90 days) ───────────────────────────────

  {
    id: 'mt-job-training',
    horizon: 'medium_term',
    category: 'employment',
    title: 'Connect with job training & employment program',
    description: 'Enroll in vocational training, resume workshops, or job placement services.',
    priority: 'medium',
    resourceTypes: ['job_training', 'employment'],
    triggers: [{ field: 'income.wants_employment_help', operator: 'eq', value: true }],
  },
  {
    id: 'mt-rapid-rehousing',
    horizon: 'medium_term',
    category: 'housing',
    title: 'Initiate rapid re-housing application',
    description: 'Apply for rapid re-housing program with rental assistance and case management support.',
    priority: 'high',
    resourceTypes: ['housing', 'case_management'],
    triggers: [{ field: 'goals.housing_preference', operator: 'in', value: ['rapid_rehousing', 'any_available'] }],
  },
  {
    id: 'mt-permanent-supportive',
    horizon: 'medium_term',
    category: 'housing',
    title: 'Initiate permanent supportive housing application',
    description: 'Apply for PSH program for long-term housing with wraparound services.',
    priority: 'high',
    resourceTypes: ['housing', 'case_management'],
    triggers: [{ field: 'goals.housing_preference', operator: 'eq', value: 'permanent_supportive' }],
  },
  {
    id: 'mt-criminal-record-review',
    horizon: 'medium_term',
    category: 'legal',
    title: 'Legal aid referral for criminal record review',
    description: 'Connect with legal aid to explore record expungement or sealing options.',
    priority: 'medium',
    resourceTypes: ['legal_aid'],
    triggers: [{ field: 'goals.barriers_to_housing', operator: 'includes', value: 'criminal_record' }],
  },
  {
    id: 'mt-credit-repair',
    horizon: 'medium_term',
    category: 'financial',
    title: 'Financial counseling & credit repair',
    description: 'Connect with financial literacy program and credit counseling services.',
    priority: 'medium',
    resourceTypes: ['financial_counseling'],
    triggers: [{ field: 'goals.barriers_to_housing', operator: 'includes', value: 'credit_history' }],
  },
  {
    id: 'mt-education',
    horizon: 'medium_term',
    category: 'education',
    title: 'Enroll in education or GED program',
    description: 'Connect with adult education, GED programs, or community college enrollment.',
    priority: 'low',
    resourceTypes: ['education'],
    triggers: [{ field: 'goals.top_priorities', operator: 'includes', value: 'education' }],
  },
  {
    id: 'mt-childcare',
    horizon: 'medium_term',
    category: 'childcare',
    title: 'Arrange childcare assistance',
    description: 'Connect with subsidized childcare programs, Head Start, or after-school programs.',
    priority: 'medium',
    resourceTypes: ['childcare'],
    triggers: [{ field: 'goals.top_priorities', operator: 'includes', value: 'childcare' }],
  },
  {
    id: 'mt-transportation',
    horizon: 'medium_term',
    category: 'transportation',
    title: 'Arrange transportation assistance',
    description: 'Connect with transit passes, ride assistance, or vehicle donation programs.',
    priority: 'low',
    resourceTypes: ['transportation'],
    triggers: [{ field: 'goals.top_priorities', operator: 'includes', value: 'transportation' }],
  },
  {
    id: 'mt-debt-management',
    horizon: 'medium_term',
    category: 'financial',
    title: 'Address debt preventing housing',
    description: 'Connect with debt management services, bankruptcy counseling, or payment plan negotiation.',
    priority: 'medium',
    resourceTypes: ['financial_counseling', 'legal_aid'],
    triggers: [{ field: 'income.owes_debt_preventing_housing', operator: 'eq', value: true }],
  },

  // ── EXPANSION — Additional Immediate Tasks ─────────────────

  {
    id: 'imm-trafficking-shelter',
    horizon: 'immediate',
    category: 'safety',
    title: 'Arrange trafficking-specific safe shelter',
    description: 'Contact local anti-trafficking organizations for emergency safe housing placement.',
    priority: 'critical',
    resourceTypes: ['shelter', 'trafficking_services'],
    triggers: [{ field: 'safety.fleeing_trafficking', operator: 'eq', value: true }],
  },
  {
    id: 'imm-hotel-voucher',
    horizon: 'immediate',
    category: 'housing',
    title: 'Issue emergency hotel/motel voucher',
    description: 'Arrange short-term hotel/motel placement when shelter beds are unavailable or inappropriate.',
    priority: 'high',
    resourceTypes: ['financial_assistance', 'housing'],
    triggers: [
      { field: 'housing.current_living_situation', operator: 'in', value: ['unsheltered', 'vehicle', 'encampment'] },
    ],
  },
  {
    id: 'imm-protective-order',
    horizon: 'immediate',
    category: 'legal',
    title: 'Assist with emergency protective order',
    description: 'Connect with courthouse victim advocate to file for an emergency protective/restraining order.',
    priority: 'critical',
    resourceTypes: ['legal_aid', 'court_advocacy'],
    triggers: [
      { field: 'safety.fleeing_dv', operator: 'eq', value: true },
      { field: 'safety.has_protective_order', operator: 'eq', value: false },
    ],
  },
  {
    id: 'imm-detox-services',
    horizon: 'immediate',
    category: 'substance_use',
    title: 'Arrange emergency detox services',
    description: 'Locate and arrange admission to detox facility for safe withdrawal management.',
    priority: 'critical',
    resourceTypes: ['substance_treatment', 'healthcare'],
    triggers: [{ field: 'safety.substance_use_current', operator: 'eq', value: 'active_crisis' }],
  },
  {
    id: 'imm-warm-handoff',
    horizon: 'immediate',
    category: 'case_management',
    title: 'Warm handoff to crisis navigator',
    description: 'Introduce client directly to an on-site or mobile crisis navigator for immediate support.',
    priority: 'high',
    resourceTypes: ['case_management', 'crisis_hotline'],
    triggers: [{ field: 'safety.mental_health_current', operator: 'in', value: ['severe_crisis', 'crisis'] }],
  },

  // ── EXPANSION — Additional Short-Term Tasks ────────────────

  {
    id: 'st-transitional-housing',
    horizon: 'short_term',
    category: 'housing',
    title: 'Apply for transitional housing program',
    description: 'Identify and submit applications to transitional housing programs with supportive services.',
    priority: 'high',
    resourceTypes: ['housing', 'case_management'],
    triggers: [{ field: 'housing.current_living_situation', operator: 'in', value: ['shelter', 'couch_surfing', 'temporary'] }],
  },
  {
    id: 'st-utility-assistance',
    horizon: 'short_term',
    category: 'financial',
    title: 'Apply for utility assistance (LIHEAP)',
    description: 'Screen for LIHEAP and local utility assistance programs to prevent service disconnection.',
    priority: 'medium',
    resourceTypes: ['financial_assistance', 'benefits_enrollment'],
    triggers: [{ field: 'goals.top_priorities', operator: 'includes', value: 'utilities' }],
  },
  {
    id: 'st-immigration-legal',
    horizon: 'short_term',
    category: 'legal',
    title: 'Connect with immigration legal aid',
    description: 'Refer to immigration attorney or legal aid organization for status-related housing barriers.',
    priority: 'high',
    resourceTypes: ['legal_aid', 'immigration_services'],
    triggers: [{ field: 'goals.barriers_to_housing', operator: 'includes', value: 'immigration_status' }],
  },
  {
    id: 'st-social-security',
    horizon: 'short_term',
    category: 'income',
    title: 'Screen for Social Security benefits (SSA)',
    description: 'Assist with SSI/SSDI application or Social Security retirement benefits enrollment.',
    priority: 'high',
    resourceTypes: ['benefits_enrollment', 'case_management'],
    triggers: [{ field: 'demographics.age', operator: 'gte', value: 62 }],
  },
  {
    id: 'st-disability-services',
    horizon: 'short_term',
    category: 'health',
    title: 'Connect with disability support services',
    description: 'Refer to disability services office for accommodations, assistive technology, and benefits navigation.',
    priority: 'high',
    resourceTypes: ['disability_services', 'case_management'],
    triggers: [{ field: 'health.has_disability', operator: 'eq', value: true }],
  },
  {
    id: 'st-clothing-hygiene',
    horizon: 'short_term',
    category: 'basic_needs',
    title: 'Provide clothing and hygiene supplies',
    description: 'Connect with clothing closets, hygiene kit distribution, and laundry access programs.',
    priority: 'medium',
    resourceTypes: ['basic_needs'],
    triggers: [{ field: 'housing.current_living_situation', operator: 'in', value: ['unsheltered', 'vehicle', 'encampment', 'shelter'] }],
  },
  {
    id: 'st-phone-connectivity',
    horizon: 'short_term',
    category: 'basic_needs',
    title: 'Obtain Lifeline phone / connectivity',
    description: 'Enroll in FCC Lifeline program for free or discounted phone service to maintain contacts.',
    priority: 'medium',
    resourceTypes: ['benefits_enrollment', 'basic_needs'],
    triggers: [{ field: 'goals.top_priorities', operator: 'includes', value: 'phone_connectivity' }],
  },
  {
    id: 'st-mental-health-ongoing',
    horizon: 'short_term',
    category: 'mental_health',
    title: 'Schedule ongoing mental health treatment',
    description: 'Connect with outpatient therapist, psychiatric prescriber, or community mental health center.',
    priority: 'high',
    resourceTypes: ['mental_health', 'healthcare'],
    triggers: [{ field: 'health.mental_health_needs', operator: 'eq', value: true }],
  },
  {
    id: 'st-peer-support',
    horizon: 'short_term',
    category: 'support',
    title: 'Connect with peer support specialist',
    description: 'Match with certified peer support specialist who has lived experience with homelessness.',
    priority: 'medium',
    resourceTypes: ['peer_support', 'case_management'],
    triggers: [{ field: 'history.total_months_homeless', operator: 'gte', value: 12 }],
  },
  {
    id: 'st-mail-address',
    horizon: 'short_term',
    category: 'documentation',
    title: 'Set up mailing address service',
    description: 'Arrange a stable mailing address through shelter mail, PO Box, or day center mail service.',
    priority: 'medium',
    resourceTypes: ['case_management', 'basic_needs'],
    triggers: [{ field: 'housing.current_living_situation', operator: 'in', value: ['unsheltered', 'vehicle', 'encampment'] }],
  },
  {
    id: 'st-child-school-enrollment',
    horizon: 'short_term',
    category: 'family',
    title: 'Ensure children\'s school enrollment (McKinney-Vento)',
    description: 'Contact school district McKinney-Vento liaison to ensure children maintain enrollment and transportation.',
    priority: 'high',
    resourceTypes: ['education', 'family_services'],
    triggers: [{ field: 'demographics.has_minor_children', operator: 'eq', value: true }],
  },
  {
    id: 'st-dv-safety-planning',
    horizon: 'short_term',
    category: 'safety',
    title: 'Comprehensive DV safety planning with advocate',
    description: 'Meet with DV advocate for detailed safety planning: escape routes, code words, document copies, financial separation.',
    priority: 'high',
    resourceTypes: ['dv_shelter', 'case_management'],
    triggers: [{ field: 'safety.fleeing_dv', operator: 'eq', value: true }],
  },

  // ── EXPANSION — Additional Medium-Term Tasks ───────────────

  {
    id: 'mt-housing-waitlist',
    horizon: 'medium_term',
    category: 'housing',
    title: 'Enroll on Section 8 / housing authority waitlist',
    description: 'Submit applications to local housing authority waitlists, Section 8 voucher programs, and project-based housing.',
    priority: 'high',
    resourceTypes: ['housing'],
    triggers: [{ field: 'goals.housing_preference', operator: 'in', value: ['voucher', 'section_8', 'any_available'] }],
  },
  {
    id: 'mt-relocation-assistance',
    horizon: 'medium_term',
    category: 'housing',
    title: 'Explore relocation assistance',
    description: 'Assess eligibility for relocation programs to areas with lower cost of living or family support.',
    priority: 'medium',
    resourceTypes: ['housing', 'financial_assistance'],
    triggers: [{ field: 'goals.open_to_relocation', operator: 'eq', value: true }],
  },
  {
    id: 'mt-family-reunification',
    horizon: 'medium_term',
    category: 'family',
    title: 'Explore family reunification services',
    description: 'Connect with family mediation, child welfare liaison, and reunification support programs.',
    priority: 'medium',
    resourceTypes: ['family_services', 'case_management'],
    triggers: [{ field: 'goals.top_priorities', operator: 'includes', value: 'family_reunification' }],
  },
  {
    id: 'mt-parenting-support',
    horizon: 'medium_term',
    category: 'family',
    title: 'Enroll in parenting support program',
    description: 'Connect with parenting classes, family support centers, and home visiting programs.',
    priority: 'low',
    resourceTypes: ['family_services', 'education'],
    triggers: [
      { field: 'demographics.has_minor_children', operator: 'eq', value: true },
      { field: 'goals.top_priorities', operator: 'includes', value: 'parenting' },
    ],
  },
  {
    id: 'mt-senior-services',
    horizon: 'medium_term',
    category: 'aging',
    title: 'Connect with senior-specific services',
    description: 'Refer to Area Agency on Aging for meals, transportation, senior housing, and in-home support.',
    priority: 'high',
    resourceTypes: ['aging_services', 'case_management'],
    triggers: [{ field: 'demographics.age', operator: 'gte', value: 60 }],
  },
  {
    id: 'mt-youth-aging-out',
    horizon: 'medium_term',
    category: 'youth',
    title: 'Connect with youth transitional services (aging out)',
    description: 'Enroll in transitional living program for youth aging out of foster care. Includes housing, mentoring, life skills.',
    priority: 'high',
    resourceTypes: ['youth_services', 'housing'],
    triggers: [
      { field: 'demographics.age', operator: 'lte', value: 24 },
      { field: 'history.foster_care_history', operator: 'eq', value: true },
    ],
  },
  {
    id: 'mt-civil-rights-legal',
    horizon: 'medium_term',
    category: 'legal',
    title: 'Housing discrimination legal consultation',
    description: 'Connect with fair housing organization or legal aid for discrimination complaints and tenant rights.',
    priority: 'medium',
    resourceTypes: ['legal_aid'],
    triggers: [{ field: 'goals.barriers_to_housing', operator: 'includes', value: 'discrimination' }],
  },
  {
    id: 'mt-savings-program',
    horizon: 'medium_term',
    category: 'financial',
    title: 'Enroll in matched savings (IDA) program',
    description: 'Connect with Individual Development Account program to build savings for housing deposit or education.',
    priority: 'low',
    resourceTypes: ['financial_counseling'],
    triggers: [{ field: 'income.has_any_income', operator: 'eq', value: true }],
  },
  {
    id: 'mt-ongoing-substance-recovery',
    horizon: 'medium_term',
    category: 'substance_use',
    title: 'Enroll in long-term recovery support',
    description: 'Connect with recovery community organization, sober living, AA/NA meetings, and recovery coaching.',
    priority: 'medium',
    resourceTypes: ['substance_treatment', 'peer_support'],
    triggers: [{ field: 'safety.substance_use_current', operator: 'in', value: ['in_recovery', 'seeking_treatment'] }],
  },
  {
    id: 'mt-domestic-violence-counseling',
    horizon: 'medium_term',
    category: 'safety',
    title: 'Ongoing DV counseling and support group',
    description: 'Enroll in DV survivor support group, individual therapy, and long-term safety planning.',
    priority: 'medium',
    resourceTypes: ['mental_health', 'dv_shelter'],
    triggers: [{ field: 'safety.fleeing_dv', operator: 'eq', value: true }],
  },
  {
    id: 'mt-workforce-development',
    horizon: 'medium_term',
    category: 'employment',
    title: 'Enroll in workforce development program',
    description: 'Connect with Workforce Innovation and Opportunity Act (WIOA) programs for training and job placement.',
    priority: 'medium',
    resourceTypes: ['job_training', 'employment'],
    triggers: [
      { field: 'income.employment_status', operator: 'in', value: ['unemployed', 'underemployed'] },
    ],
  },
  {
    id: 'mt-health-home',
    horizon: 'medium_term',
    category: 'health',
    title: 'Establish primary care medical home',
    description: 'Connect with FQHC or community health center for ongoing primary care, prescriptions, and preventive health.',
    priority: 'medium',
    resourceTypes: ['healthcare'],
    triggers: [{ field: 'health.has_primary_care', operator: 'eq', value: false }],
  },
];

// ── Trigger Evaluation ─────────────────────────────────────────

function getNestedValue(data: IntakeData, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = data;

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

function evaluateTrigger(data: IntakeData, trigger: TriggerCondition): boolean {
  const actual = getNestedValue(data, trigger.field);

  switch (trigger.operator) {
    case 'eq':
      return actual === trigger.value;
    case 'neq':
      return actual !== trigger.value;
    case 'gte':
      return typeof actual === 'number' && actual >= (trigger.value as number);
    case 'lte':
      return typeof actual === 'number' && actual <= (trigger.value as number);
    case 'exists':
      return actual !== undefined && actual !== null;
    case 'in':
      if (Array.isArray(trigger.value)) {
        return trigger.value.includes(actual);
      }
      return false;
    case 'includes':
      if (Array.isArray(actual)) {
        return actual.includes(trigger.value);
      }
      return false;
    default:
      return false;
  }
}

function allTriggersMatch(data: IntakeData, triggers: TriggerCondition[]): boolean {
  return triggers.every(trigger => evaluateTrigger(data, trigger));
}

// ── Priority Sort ──────────────────────────────────────────────

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function sortByPriority(tasks: ActionTask[]): ActionTask[] {
  return tasks.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
}

// ── Main Entry Point ───────────────────────────────────────────

/**
 * Generate a 3-horizon action plan from intake data.
 *
 * Pure function — deterministic, no side effects.
 */
export function generatePlan(data: IntakeData): ActionPlanResult {
  const immediateTasks: ActionTask[] = [];
  const shortTermTasks: ActionTask[] = [];
  const mediumTermTasks: ActionTask[] = [];

  for (const template of TASK_LIBRARY) {
    if (allTriggersMatch(data, template.triggers)) {
      const task: ActionTask = {
        id: template.id,
        horizon: template.horizon,
        category: template.category,
        title: template.title,
        description: template.description,
        priority: template.priority,
        resourceTypes: template.resourceTypes,
      };

      switch (template.horizon) {
        case 'immediate':
          immediateTasks.push(task);
          break;
        case 'short_term':
          shortTermTasks.push(task);
          break;
        case 'medium_term':
          mediumTermTasks.push(task);
          break;
      }
    }
  }

  return {
    immediateTasks: sortByPriority(immediateTasks),
    shortTermTasks: sortByPriority(shortTermTasks),
    mediumTermTasks: sortByPriority(mediumTermTasks),
    generatedAt: new Date().toISOString(),
    taskCount: immediateTasks.length + shortTermTasks.length + mediumTermTasks.length,
  };
}
