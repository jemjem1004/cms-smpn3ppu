import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // Connection pooling URL for queries
    url: process.env["DATABASE_URL"],
    // Direct connection URL for migrations (Neon)
    directUrl: process.env["DIRECT_URL"],
  },
});
