# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 複製 package 與 lock 檔
COPY package.json pnpm-lock.yaml* ./

# 安裝依賴
RUN if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install --frozen-lockfile; \
    else npm install; \
    fi


# Stage 2: Build Nuxt application
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 建置 Nuxt（會輸出到 .output）
RUN if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
    else npm run build; \
    fi


# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxt

# 複製 Nuxt build 輸出
COPY --from=builder --chown=nuxt:nodejs /app/.output ./.output
COPY --from=builder --chown=nuxt:nodejs /app/public ./public

USER nuxt

EXPOSE 3000

ENV PORT=3000
ENV HOST=0.0.0.0

CMD ["node", ".output/server/index.mjs"]