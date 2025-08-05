import * as dotenv from "dotenv";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://dev_user:dev_password@localhost:5432/b-random",
    // host: process.env.DB_HOST || "localhost",
    // port: Number(process.env.DB_PORT) || 5432,
    // user: process.env.DB_USER || "dev_user",
    // password: process.env.DB_PASSWORD || "dev_password",
    // database: process.env.DB_NAME || "b-random",
  },
});
