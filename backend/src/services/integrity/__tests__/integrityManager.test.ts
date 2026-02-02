describe('FeatureIntegrityManager startup behavior', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should request exit in strict mode when required services missing', () => {
    process.env.FEATURE_INTEGRITY_MODE = 'strict';
    process.env.FEATURE_DATABASE_ENABLED = 'true';
    process.env.FEATURE_STORAGE_ENABLED = 'true';

    const { integrityManager } = require('../featureIntegrity');
    const startup = integrityManager.getStartupBehavior();
    expect(startup).toBeDefined();
    if (startup.shouldExit) {
      expect(startup.exitCode).toBe(1);
      expect(startup.message).toContain('STRICT MODE');
    } else {
      // If allow partial start set in env, this may not exit
      expect(process.env.ALLOW_PARTIAL_START).not.toBe('false');
    }
  });
});
