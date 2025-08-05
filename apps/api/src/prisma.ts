import { PrismaClient } from "../../generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const db = new PrismaClient({
    adapter,
    log: ["query", "info", "warn", "error"],
    transactionOptions: {
        isolationLevel: "ReadCommitted",
        timeout: 10000,
        maxWait: 10000,
    },
    errorFormat: "pretty",
    omit: {},
});


export { db };
