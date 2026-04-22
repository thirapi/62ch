import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "./schema"

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof postgres> | undefined;
};

const client = globalForDb.client ?? postgres(connectionString, {
  prepare: false,
  // Di lingkungan serverless (Vercel), kita kecilkan max connection 
  // karena setiap instance fungsi akan membuka pool sendiri.
  max: process.env.NODE_ENV === "production" ? 1 : 10,
});

// Selalu simpan di global agar bisa di-reuse saat 'warm start' di serverless/production
globalForDb.client = client;

export const db = drizzle(client, { schema });

