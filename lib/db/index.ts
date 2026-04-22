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
  // Kita gunakan limit 5 agar tidak terjadi deadlock saat parallel rendering di build/production
  max: 5,
});

// Selalu simpan di global agar bisa di-reuse saat 'warm start' di serverless/production
globalForDb.client = client;

export const db = drizzle(client, { schema });

