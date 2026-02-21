// Resolver for nodemailer createTransport to handle CJS/ESM module shape differences
import * as fs from "fs";

export type CreateTransportFn = (...args: any[]) => any;

export function resolveCreateTransport(): CreateTransportFn {
  // Use runtime require to avoid static ESM default import pitfalls
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nm = require("nodemailer");
  // Prefer the standard API shapes first (`createTransport`), then ESM default, then test-provided hooks.
  let createTransport =
    nm.createTransport ??
    nm.default?.createTransport ??
    nm.__createTransportMock;

  // If no createTransport function is available but tests provided a __sendMailMock,
  // create a lightweight factory that returns an object using that mock. This
  // ensures tests that only export a sendMail mock still work deterministically.
  if (
    typeof createTransport !== "function" &&
    typeof nm.__sendMailMock === "function"
  ) {
    createTransport = () => ({ sendMail: nm.__sendMailMock });
  }

  if (typeof createTransport !== "function") {
    const msg =
      "Nodemailer createTransport unavailable (module shape mismatch)";
    // If debugging enabled, write to stderr for visibility
    if (process.env.DEBUG_EMAIL === "true") {
      try {
        fs.writeFileSync("/dev/stderr", msg + "\n");
      } catch (e) {}
      // fallback console
      // eslint-disable-next-line no-console
      console.error("[emailTransport] " + msg);
    }
    throw new Error(msg);
  }

  return createTransport as CreateTransportFn;
}

export default { resolveCreateTransport };
