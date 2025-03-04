import { drizzle } from 'drizzle-orm/postgres-js';

export const db = drizzle(import.meta.env.DATABASE_URL);
