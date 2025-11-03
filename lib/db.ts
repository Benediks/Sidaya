// lib/db.ts
import 'server-only'; // 👈 Add this as the FIRST line
import { Pool, neon } from '@neondatabase/serverless';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const sql = neon(process.env.DATABASE_URL!);