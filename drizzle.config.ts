import type { Config } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("The DATABASE_URL environment variable must be defined");
}

export default {
  out: "./db/migrations",
  schema: "./db/schema.ts",
  breakpoints: true,
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
} satisfies Config;
