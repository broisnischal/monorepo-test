import { PrismaClient } from "../generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
  log: ["query", "info", "warn", "error"],
  transactionOptions: {
    isolationLevel: "ReadCommitted",
    timeout: 10000,
    maxWait: 10000,
  },
  errorFormat: "pretty",
  // datasources: {
  //   db: {
  //     url: process.env.DATABASE_URL!,
  //   },
  // },
  // PrismaClientInitializationError: Custom datasource configuration is not compatible with Prisma Driver Adapters.
  omit: {},
});

export { prisma };
