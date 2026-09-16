/**
 * Prisma ORM v8 database client — Maison Vale
 *
 * Uses @prisma/orm-postgres runtime against Supabase Postgres.
 * Singleton pattern prevents connection pool exhaustion during Next.js hot reload.
 *
 * Import `db` wherever you need to query the database.
 * The contract type is generated from src/prisma/contract.prisma.
 */
import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "./contract.d";
import contractJson from "./contract.json" with { type: "json" };

// Type-safe DB client singleton
declare global {
  // eslint-disable-next-line no-var
  var __db: ReturnType<typeof postgres<Contract>> | undefined;
}

function createDb() {
  return postgres<Contract>({
    contractJson,
    url: process.env.DATABASE_URL!,
  });
}

const db = globalThis.__db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalThis.__db = db;
}

export { db };
