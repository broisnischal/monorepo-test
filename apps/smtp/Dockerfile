
FROM oven/bun:latest AS builder
WORKDIR /app

COPY bun.lock package.json tsconfig.json ./
RUN bun install --production

COPY . .

FROM oven/bun:slim AS runner
WORKDIR /app

# COPY --from=builder . .
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
# COPY --from=builder /app/db.ts db.ts
# COPY --from=builder /app/generated ./generated

EXPOSE 25
CMD ["bun", "run", "src/index.ts"]