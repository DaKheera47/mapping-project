import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
  throw Error('DATABASE_URL not defined');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
