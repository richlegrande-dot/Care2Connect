describe("Health monitor includes integrity info", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("reflects FEATURE_INTEGRITY_MODE from env", async () => {
    process.env.FEATURE_INTEGRITY_MODE = "demo";
    const { healthMonitor } = require("../healthMonitor");
    const snapshot = await healthMonitor.performHealthCheck();
    expect(snapshot.integrity).toBeDefined();
    expect(snapshot.integrity.mode).toBe("demo");
  });
});
