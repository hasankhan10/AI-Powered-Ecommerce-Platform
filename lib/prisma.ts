/**
 * Re-exports the typed Prisma v8 database client.
 * Import `db` from here throughout the app:
 *   import { db } from '@/lib/prisma'
 *
 * The actual client is in src/prisma/db.ts — this file is the canonical
 * import alias so components don't need to know the internal path.
 */
export { db } from "@/src/prisma/db";
