import { metricsCollector } from "../metricsCollector";

describe("MetricsCollector token protection", () => {
  it("verifyToken returns false if token not set", () => {
    const prev = process.env.METRICS_TOKEN;
    process.env.METRICS_TOKEN = "";
    const ok = metricsCollector.verifyToken(undefined);
    expect(ok).toBe(false);
    process.env.METRICS_TOKEN = prev;
  });

  it("verifyToken validates correct token", () => {
    const prev = process.env.METRICS_TOKEN;
    process.env.METRICS_TOKEN = "s3cr3t";
    const ok = metricsCollector.verifyToken("s3cr3t");
    expect(ok).toBe(true);
    process.env.METRICS_TOKEN = prev;
  });
});
