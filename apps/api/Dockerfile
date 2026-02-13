FROM node:20-alpine AS base

FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install turbo --global
COPY . .
RUN turbo prune --scope=@aanandini/api --docker

FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm ci

COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

RUN npx prisma generate --schema=./packages/db/prisma/schema.prisma
RUN npx turbo run build --filter=@aanandini/api...

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy build output and dependencies
COPY --from=installer /app/apps/api/package.json .
COPY --from=installer --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=installer --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=installer --chown=nestjs:nodejs /app/packages/db ./packages/db
COPY --from=installer --chown=nestjs:nodejs /app/packages/db/prisma ./prisma

# Re-create workspace symlink (Docker COPY can't follow cross-directory symlinks)
RUN rm -rf node_modules/@aanandini/db && ln -s /app/packages/db node_modules/@aanandini/db

# Create uploads dir in case S3 is not configured
RUN mkdir -p /app/uploads && chown nestjs:nodejs /app/uploads

USER nestjs

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push --schema=./prisma/schema.prisma --skip-generate && node dist/main"]
