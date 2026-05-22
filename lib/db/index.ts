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
  // Tuning for scalability:
  // - max: limit to prevent exhausting DB connections in serverless/high-concurrency
  // - idle_timeout: close idle connections to free up resources
  // - connect_timeout: fail fast if DB is unreachable
  max: process.env.NODE_ENV === 'production' ? 20 : 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Selalu simpan di global agar bisa di-reuse saat 'warm start' di serverless/production
globalForDb.client = client;

export const db = drizzle(client, { schema });

