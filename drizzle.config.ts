import type { Config } from "drizzle-kit";

if (
  !process.env.DB_HOST ||
  !process.env.DB_USER ||
  !process.env.DB_PASSWORD ||
  !process.env.DB_NAME
) {
  throw new Error(
    "The DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME environment variables must be defined"
  );
}

export default {
  out: "./db/migrations",
  schema: "./db/schema.ts",
  breakpoints: true,
  driver: "mysql2",
  dbCredentials: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
} satisfies Config;
