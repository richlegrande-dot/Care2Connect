const { spawn } = require("child_process");
const path = require("path");

// Simple frontend starter that bypasses validation for PM2
// This runs Next.js directly without the validation script

const nextPath = path.join(__dirname, "..", "node_modules", ".bin", "next");
const frontend = spawn(
  "node",
  [
    path.join(__dirname, "..", "node_modules", "next", "dist", "bin", "next"),
    "start",
  ],
  {
    env: {
      ...process.env,
      PORT: process.env.PORT || "3000",
      NODE_ENV: process.env.NODE_ENV || "production",
    },
    stdio: "inherit",
    cwd: __dirname,
  },
);

frontend.on("error", (err) => {
  console.error("Failed to start frontend:", err);
  process.exit(1);
});

frontend.on("exit", (code) => {
  console.log(`Frontend exited with code ${code}`);
  process.exit(code);
});

// Handle termination signals
process.on("SIGINT", () => {
  frontend.kill("SIGINT");
});

process.on("SIGTERM", () => {
  frontend.kill("SIGTERM");
});
