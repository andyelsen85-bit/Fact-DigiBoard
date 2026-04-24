FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

# ────────────────────────────────────────────
# Stage 1: Install all workspace dependencies
# ────────────────────────────────────────────
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY lib/db/package.json                    lib/db/
COPY lib/api-client-react/package.json      lib/api-client-react/
COPY lib/api-zod/package.json               lib/api-zod/
COPY artifacts/api-server/package.json      artifacts/api-server/
COPY artifacts/factboard/package.json       artifacts/factboard/

RUN pnpm install --frozen-lockfile --ignore-scripts

# ────────────────────────────────────────────
# Stage 2: Build all packages
# ────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app
COPY . .

RUN pnpm --filter @workspace/api-zod       run build || true
RUN pnpm --filter @workspace/api-client-react run build || true

RUN pnpm rebuild rollup

RUN PORT=80 BASE_PATH=/ NODE_ENV=production \
    pnpm --filter @workspace/factboard run build

RUN pnpm --filter @workspace/api-server run build

# ────────────────────────────────────────────
# Stage 3: Production runtime image
# ────────────────────────────────────────────
FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

ENV NODE_ENV=production

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY lib/db/package.json                    lib/db/
COPY lib/api-client-react/package.json      lib/api-client-react/
COPY lib/api-zod/package.json               lib/api-zod/
COPY artifacts/api-server/package.json      artifacts/api-server/
COPY artifacts/factboard/package.json       artifacts/factboard/

RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY --from=builder /app/artifacts/api-server/dist            artifacts/api-server/dist
COPY --from=builder /app/artifacts/factboard/dist/public      artifacts/api-server/dist/public

EXPOSE 8080
ENV PORT=8080

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
