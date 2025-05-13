FROM node:22-slim AS base

# Enable corepack and pnpm
RUN corepack enable && \
    corepack prepare pnpm@latest --activate && \
    node --version && \
    npm --version && \
    pnpm --version

# Set up PNPM_HOME
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN mkdir -p $PNPM_HOME

# Install system dependencies for native modules
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    build-essential \
    openssl \
    libvips-dev \
    protobuf-compiler \
    && rm -rf /var/lib/apt/lists/*

FROM base AS builder

WORKDIR /workspace

# Copy root config files
COPY package.json ./
COPY pnpm*.yaml ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY jest.config.ts ./
COPY jest.preset.js ./
COPY eslint.config.mjs ./
COPY webpack.*.config.js ./

# Copy monorepo apps and libs package.json
COPY apps/transaction/package.json ./apps/transaction/package.json
COPY libs/nestjs/package.json ./libs/nestjs/package.json
COPY libs/typeorm/package.json ./libs/typeorm/package.json
COPY libs/microservice-client/package.json ./libs/microservice-client/package.json
COPY libs/grpc/package.json ./libs/grpc/package.json

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy monorepo apps and libs
COPY apps/transaction ./apps/transaction
COPY libs/nestjs ./libs/nestjs
COPY libs/microservice-client ./libs/microservice-client
COPY libs/typeorm ./libs/typeorm
COPY libs/grpc ./libs/grpc



# Build the application
RUN npx nx build transaction

FROM base AS runner

WORKDIR /app

# Copy necessary files for production install
COPY --from=builder /workspace/package.json ./
COPY --from=builder /workspace/apps/transaction/package.json ./apps/transaction/package.json
COPY --from=builder /workspace/libs/nestjs/package.json ./libs/nestjs/package.json
COPY --from=builder /workspace/libs/typeorm/package.json ./libs/typeorm/package.json
COPY --from=builder /workspace/libs/microservice-client/package.json ./libs/microservice-client/package.json
COPY --from=builder /workspace/libs/grpc/package.json ./libs/grpc/package.json
COPY --from=builder /workspace/pnpm*.yaml ./

# Set production environment
ENV NODE_ENV=production

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod && pnpm rebuild

# Copy built output
COPY --from=builder /workspace/dist ./dist

CMD ["node", "dist/apps/transaction/main"]
