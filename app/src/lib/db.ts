import { PrismaClient } from "@prisma/client";

// ─── Prisma Client Singleton ──────────────────────────────────────────────────
// Prevents multiple Prisma Client instances during Next.js hot-reload in dev.
// Pattern: store the client on globalThis in development, create fresh in prod.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
