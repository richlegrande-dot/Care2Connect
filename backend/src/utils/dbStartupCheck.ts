import type { PrismaClient } from "@prisma/client";

/**
 * Check database connectivity at startup and provide actionable errors.
 * Does not log or return the full DATABASE_URL to avoid leaking secrets.
 */
export async function checkDatabaseStartup(
  prisma: PrismaClient,
): Promise<boolean> {
  try {
    // Lightweight ping
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // @ts-ignore
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error: any) {
    const msg = String(error?.message || error || "Unknown DB error");

    // Detect common auth failure signatures without exposing secrets
    const authIndicators = [
      "password authentication failed",
      "authentication failed",
      "FATAL:  password",
      "invalid password",
    ];

    if (authIndicators.some((i) => msg.toLowerCase().includes(i))) {
      console.error(
        "DB auth failed — check DATABASE_URL password vs container POSTGRES_PASSWORD",
      );
    } else {
      console.error("DB connection failed:", msg);
    }

    return false;
  }
}

export default checkDatabaseStartup;
