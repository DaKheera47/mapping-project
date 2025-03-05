import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

export const db = drizzle(import.meta.env.DATABASE_URL, {
  schema,
});
