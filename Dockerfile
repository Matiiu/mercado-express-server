# syntax=docker/dockerfile:1

# ── Base ──────────────────────────────────────────────────────────────
# Node.js 22 LTS (matches engines used in development, see README).
FROM node:22-alpine AS base
# Prisma engines require OpenSSL on Alpine.
RUN apk add --no-cache openssl
WORKDIR /app

# ── Dependencies (with devDependencies, needed to build) ────────────────
FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci

# ── Build ────────────────────────────────────────────────────────────────
FROM base AS build
# Dummy value: `prisma generate` only reads the schema, it never connects to
# a database, but prisma.config.ts requires DATABASE_URL to be defined.
ENV DATABASE_URL="postgresql://user:password@localhost:5432/db?schema=public"
COPY package.json package-lock.json ./
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev

# ── Production ───────────────────────────────────────────────────────────
FROM base AS production
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/src/main"]
