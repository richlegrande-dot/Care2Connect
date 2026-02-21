#!/usr/bin/env node
import http from "http";
import app from "../server";

async function startWithFailover() {
  const requested = Number(process.env.PORT) || 3001;
  const range = Number(process.env.PORT_FAILOVER_RANGE || 20);

  const server = http.createServer(app as any);

  for (let i = 0; i <= range; i++) {
    const tryPort = requested + i;
    try {
      await new Promise<void>((resolve, reject) => {
        server.once("error", (err) => reject(err));
        server.once("listening", () => resolve());
        server.listen(tryPort, "0.0.0.0");
      });
      console.log(`BOUND_PORT:${tryPort}`);
      // Keep server alive briefly for tests to probe then exit
      setTimeout(() => process.exit(0), 3000);
      return;
    } catch (e: any) {
      if (e && (e.code === "EADDRINUSE" || e.code === "EACCES")) {
        continue;
      }
      console.error("Failed to bind:", e?.message || e);
      process.exit(2);
    }
  }

  console.error("No free port found in range");
  process.exit(3);
}

startWithFailover();
