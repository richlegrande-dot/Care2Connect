/**
 * Expanded Task Library — Unit Tests
 *
 * Tests the 27 new task templates added in P1#6.
 * Verifies trigger evaluation for newly added tasks across
 * all three horizons.
 */

import { generatePlan } from '../../src/intake/v2/action_plans/generatePlan';

describe('Expanded Task Library', () => {
  describe('New immediate tasks', () => {
    it('trafficking → trafficking shelter', () => {
      const plan = generatePlan({ safety: { fleeing_trafficking: true } });
      expect(plan.immediateTasks.find(t => t.id === 'imm-trafficking-shelter')).toBeDefined();
    });

    it('unsheltered → hotel/motel voucher', () => {
      const plan = generatePlan({ housing: { current_living_situation: 'unsheltered' } });
      expect(plan.immediateTasks.find(t => t.id === 'imm-hotel-voucher')).toBeDefined();
    });

    it('vehicle living → hotel/motel voucher', () => {
      const plan = generatePlan({ housing: { current_living_situation: 'vehicle' } });
      expect(plan.immediateTasks.find(t => t.id === 'imm-hotel-voucher')).toBeDefined();
    });

    it('DV + no protective order → protective order assistance', () => {
      const plan = generatePlan({
        safety: { fleeing_dv: true, has_protective_order: false },
      });
      expect(plan.immediateTasks.find(t => t.id === 'imm-protective-order')).toBeDefined();
    });

    it('DV + HAS protective order → no protective order task', () => {
      const plan = generatePlan({
        safety: { fleeing_dv: true, has_protective_order: true },
      });
      expect(plan.immediateTasks.find(t => t.id === 'imm-protective-order')).toBeUndefined();
    });

    it('active substance crisis → detox services', () => {
      const plan = generatePlan({ safety: { substance_use_current: 'active_crisis' } });
      expect(plan.immediateTasks.find(t => t.id === 'imm-detox-services')).toBeDefined();
    });

    it('severe mental health crisis → warm handoff', () => {
      const plan = generatePlan({ safety: { mental_health_current: 'severe_crisis' } });
      expect(plan.immediateTasks.find(t => t.id === 'imm-warm-handoff')).toBeDefined();
    });

    it('non-crisis mental health → no warm handoff', () => {
      const plan = generatePlan({ safety: { mental_health_current: 'stable' } });
      expect(plan.immediateTasks.find(t => t.id === 'imm-warm-handoff')).toBeUndefined();
    });
  });

  describe('New short-term tasks', () => {
    it('couch surfing → transitional housing', () => {
      const plan = generatePlan({ housing: { current_living_situation: 'couch_surfing' } });
      expect(plan.shortTermTasks.find(t => t.id === 'st-transitional-housing')).toBeDefined();
    });

    it('utilities priority → utility assistance', () => {
      const plan = generatePlan({ goals: { top_priorities: ['utilities'] } });
      expect(plan.shortTermTasks.find(t => t.id === 'st-utility-assistance')).toBeDefined();
    });

    it('immigration barrier → immigration legal aid', () => {
      const plan = generatePlan({ goals: { barriers_to_housing: ['immigration_status'] } });
      expect(plan.shortTermTasks.find(t => t.id === 'st-immigration-legal')).toBeDefined();
    });

    it('age 62+ → social security screening', () => {
      const plan = generatePlan({ demographics: { age: 65 } });
      expect(plan.shortTermTasks.find(t => t.id === 'st-social-security')).toBeDefined();
    });

    it('age 55 → no social security screening', () => {
      const plan = generatePlan({ demographics: { age: 55 } });
      expect(plan.shortTermTasks.find(t => t.id === 'st-social-security')).toBeUndefined();
    });

    it('has disability → disability services', () => {
      const plan = generatePlan({ health: { has_disability: true } });
      expect(plan.shortTermTasks.find(t => t.id === 'st-disability-services')).toBeDefined();
    });

    it('unsheltered → clothing/hygiene supplies', () => {
      const plan = generatePlan({ housing: { current_living_situation: 'unsheltered' } });
      expect(plan.shortTermTasks.find(t => t.id === 'st-clothing-hygiene')).toBeDefined();
    });

    it('phone_connectivity priority → Lifeline phone', () => {
      const plan = generatePlan({ goals: { top_priorities: ['phone_connectivity'] } });
      expect(plan.shortTermTasks.find(t => t.id === 'st-phone-connectivity')).toBeDefined();
    });

    it('mental health needs → ongoing mental health treatment', () => {
      const plan = generatePlan({ health: { mental_health_needs: true } });
      expect(plan.shortTermTasks.find(t => t.id === 'st-mental-health-ongoing')).toBeDefined();
    });

    it('12+ months homeless → peer support', () => {
      const plan = generatePlan({ history: { total_months_homeless: 14 } });
      expect(plan.shortTermTasks.find(t => t.id === 'st-peer-support')).toBeDefined();
    });

    it('6 months homeless → no peer support', () => {
      const plan = generatePlan({ history: { total_months_homeless: 6 } });
      expect(plan.shortTermTasks.find(t => t.id === 'st-peer-support')).toBeUndefined();
    });

    it('unsheltered → mailing address service', () => {
      const plan = generatePlan({ housing: { current_living_situation: 'unsheltered' } });
      expect(plan.shortTermTasks.find(t => t.id === 'st-mail-address')).toBeDefined();
    });

    it('has minor children → school enrollment', () => {
      const plan = generatePlan({ demographics: { has_minor_children: true } });
      expect(plan.shortTermTasks.find(t => t.id === 'st-child-school-enrollment')).toBeDefined();
    });

    it('fleeing DV → comprehensive safety planning', () => {
      const plan = generatePlan({ safety: { fleeing_dv: true } });
      expect(plan.shortTermTasks.find(t => t.id === 'st-dv-safety-planning')).toBeDefined();
    });
  });

  describe('New medium-term tasks', () => {
    it('voucher preference → housing waitlist', () => {
      const plan = generatePlan({ goals: { housing_preference: 'voucher' } });
      expect(plan.mediumTermTasks.find(t => t.id === 'mt-housing-waitlist')).toBeDefined();
    });

    it('open to relocation → relocation assistance', () => {
      const plan = generatePlan({ goals: { open_to_relocation: true } });
      expect(plan.mediumTermTasks.find(t => t.id === 'mt-relocation-assistance')).toBeDefined();
    });

    it('family reunification priority → family reunification services', () => {
      const plan = generatePlan({ goals: { top_priorities: ['family_reunification'] } });
      expect(plan.mediumTermTasks.find(t => t.id === 'mt-family-reunification')).toBeDefined();
    });

    it('minor children + parenting priority → parenting support', () => {
      const plan = generatePlan({
        demographics: { has_minor_children: true },
        goals: { top_priorities: ['parenting'] },
      });
      expect(plan.mediumTermTasks.find(t => t.id === 'mt-parenting-support')).toBeDefined();
    });

    it('age 60+ → senior services', () => {
      const plan = generatePlan({ demographics: { age: 60 } });
      expect(plan.mediumTermTasks.find(t => t.id === 'mt-senior-services')).toBeDefined();
    });

    it('age 24 + foster care → youth transitional services', () => {
      const plan = generatePlan({
        demographics: { age: 22 },
        history: { foster_care_history: true },
      });
      expect(plan.mediumTermTasks.find(t => t.id === 'mt-youth-aging-out')).toBeDefined();
    });

    it('age 30 + foster care → no youth services', () => {
      const plan = generatePlan({
        demographics: { age: 30 },
        history: { foster_care_history: true },
      });
      expect(plan.mediumTermTasks.find(t => t.id === 'mt-youth-aging-out')).toBeUndefined();
    });

    it('discrimination barrier → housing discrimination legal', () => {
      const plan = generatePlan({ goals: { barriers_to_housing: ['discrimination'] } });
      expect(plan.mediumTermTasks.find(t => t.id === 'mt-civil-rights-legal')).toBeDefined();
    });

    it('has income → savings program', () => {
      const plan = generatePlan({ income: { has_any_income: true } });
      expect(plan.mediumTermTasks.find(t => t.id === 'mt-savings-program')).toBeDefined();
    });

    it('in recovery → long-term recovery support', () => {
      const plan = generatePlan({ safety: { substance_use_current: 'in_recovery' } });
      expect(plan.mediumTermTasks.find(t => t.id === 'mt-ongoing-substance-recovery')).toBeDefined();
    });

    it('fleeing DV → DV counseling (medium-term)', () => {
      const plan = generatePlan({ safety: { fleeing_dv: true } });
      expect(plan.mediumTermTasks.find(t => t.id === 'mt-domestic-violence-counseling')).toBeDefined();
    });

    it('unemployed → workforce development', () => {
      const plan = generatePlan({ income: { employment_status: 'unemployed' } });
      expect(plan.mediumTermTasks.find(t => t.id === 'mt-workforce-development')).toBeDefined();
    });

    it('no primary care → establish medical home', () => {
      const plan = generatePlan({ health: { has_primary_care: false } });
      expect(plan.mediumTermTasks.find(t => t.id === 'mt-health-home')).toBeDefined();
    });
  });

  describe('Task count validation', () => {
    it('complex case generates many tasks across horizons', () => {
      const plan = generatePlan({
        safety: { fleeing_dv: true, has_protective_order: false, experienced_violence_recently: true },
        housing: { current_living_situation: 'unsheltered' },
        health: { needs_immediate_medical: true, has_disability: true, mental_health_needs: true, has_primary_care: false },
        demographics: { veteran_status: true, has_minor_children: true },
        income: { has_any_income: false, has_valid_id: false },
        history: { total_months_homeless: 24 },
      });

      expect(plan.taskCount).toBeGreaterThanOrEqual(15);
      expect(plan.immediateTasks.length).toBeGreaterThanOrEqual(3);
      expect(plan.shortTermTasks.length).toBeGreaterThanOrEqual(5);
      expect(plan.mediumTermTasks.length).toBeGreaterThanOrEqual(2);
    });

    it('all immediate tasks are critical or high priority', () => {
      const plan = generatePlan({
        safety: { fleeing_dv: true, has_protective_order: false },
        housing: { current_living_situation: 'unsheltered' },
        health: { needs_immediate_medical: true },
      });
      for (const task of plan.immediateTasks) {
        expect(['critical', 'high']).toContain(task.priority);
      }
    });
  });
});
