/**
 * V2 Action Plan Generator — Unit Tests
 *
 * Tests generatePlan() for:
 *   - Task triggering based on intake data
 *   - Priority sorting within horizons
 *   - No false triggers on empty/irrelevant data
 */

import { generatePlan } from '../../src/intake/v2/action_plans/generatePlan';
import type { IntakeData } from '../../src/intake/v2/scoring/computeScores';

describe('V2 Action Plan Generator', () => {
  describe('Empty input', () => {
    it('generates no tasks', () => {
      const plan = generatePlan({});
      expect(plan.taskCount).toBe(0);
      expect(plan.immediateTasks).toHaveLength(0);
      expect(plan.shortTermTasks).toHaveLength(0);
      expect(plan.mediumTermTasks).toHaveLength(0);
    });
  });

  describe('Immediate tasks', () => {
    it('fleeing DV → DV hotline task', () => {
      const plan = generatePlan({ safety: { fleeing_dv: true } });
      const dvTask = plan.immediateTasks.find(t => t.id === 'imm-dv-hotline');
      expect(dvTask).toBeDefined();
      expect(dvTask?.priority).toBe('critical');
    });

    it('suicidal ideation → crisis counselor', () => {
      const plan = generatePlan({ safety: { suicidal_ideation_recent: true } });
      expect(plan.immediateTasks.find(t => t.id === 'imm-crisis-counselor')).toBeDefined();
    });

    it('unsheltered → shelter bed', () => {
      const plan = generatePlan({ housing: { current_living_situation: 'unsheltered' } });
      expect(plan.immediateTasks.find(t => t.id === 'imm-shelter-bed')).toBeDefined();
    });

    it('medication needs + no access → medication task', () => {
      const plan = generatePlan({
        health: { needs_medication: true, has_access_to_medication: false },
      });
      expect(plan.immediateTasks.find(t => t.id === 'imm-medication-access')).toBeDefined();
    });

    it('medication needs + HAS access → no medication task', () => {
      const plan = generatePlan({
        health: { needs_medication: true, has_access_to_medication: true },
      });
      expect(plan.immediateTasks.find(t => t.id === 'imm-medication-access')).toBeUndefined();
    });
  });

  describe('Short-term tasks', () => {
    it('no income → benefits screening', () => {
      const plan = generatePlan({ income: { has_any_income: false } });
      expect(plan.shortTermTasks.find(t => t.id === 'st-income-benefits')).toBeDefined();
    });

    it('no valid ID → ID assistance', () => {
      const plan = generatePlan({ income: { has_valid_id: false } });
      expect(plan.shortTermTasks.find(t => t.id === 'st-obtain-id')).toBeDefined();
    });

    it('veteran → veteran services', () => {
      const plan = generatePlan({ demographics: { veteran_status: true } });
      expect(plan.shortTermTasks.find(t => t.id === 'st-veteran-services')).toBeDefined();
    });
  });

  describe('Medium-term tasks', () => {
    it('wants employment help → job training', () => {
      const plan = generatePlan({ income: { wants_employment_help: true } });
      expect(plan.mediumTermTasks.find(t => t.id === 'mt-job-training')).toBeDefined();
    });

    it('criminal record barrier → legal aid', () => {
      const plan = generatePlan({
        goals: { barriers_to_housing: ['criminal_record'] },
      });
      expect(plan.mediumTermTasks.find(t => t.id === 'mt-criminal-record-review')).toBeDefined();
    });
  });

  describe('Priority sorting', () => {
    it('critical tasks come before high priority', () => {
      const data: IntakeData = {
        safety: { fleeing_dv: true, experienced_violence_recently: true },
        housing: { current_living_situation: 'unsheltered' },
        health: { needs_immediate_medical: true },
      };
      const plan = generatePlan(data);
      const critIdx = plan.immediateTasks.findIndex(t => t.priority === 'critical');
      const highIdx = plan.immediateTasks.findIndex(t => t.priority === 'high');
      if (critIdx !== -1 && highIdx !== -1) {
        expect(critIdx).toBeLessThan(highIdx);
      }
    });
  });

  describe('Metadata', () => {
    it('includes generatedAt timestamp', () => {
      const plan = generatePlan({});
      expect(typeof plan.generatedAt).toBe('string');
      expect(plan.generatedAt.length).toBeGreaterThan(0);
    });
  });
});
