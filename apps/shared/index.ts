console.log("Apply Pending Migrations");

import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

const migrationsPath = join(__dirname, "../migrations");

if (existsSync(migrationsPath)) {
  const migrations = execSync(
    `npx prisma migrate dev --name "apply-pending-migrations" --schema=${join(
      __dirname,
      "../prisma/model.prisma"
    )}`,
    { cwd: migrationsPath }
  ).toString();
  console.log(migrations);
}

prisma.$disconnect();
console.log("Migrations applied successfully.");
