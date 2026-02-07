# Use Node.js 20 Alpine as base
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root config and package files
COPY package.json package-lock.json ./
COPY packages/api/package.json ./packages/api/
COPY packages/common/package.json ./packages/common/

# Install dependencies
RUN npm install

# Copy source code
COPY packages/api ./packages/api
COPY packages/common ./packages/common

# Generate Prisma Client
RUN cd packages/api && npx prisma generate

# Build common and api
RUN npm run build --workspace=@dataspace/common
RUN npm run build --workspace=@dataspace/api

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/api/dist ./packages/api/dist
COPY --from=builder /app/packages/api/package.json ./packages/api/package.json
COPY --from=builder /app/packages/api/prisma ./packages/api/prisma

EXPOSE 3000

CMD ["npm", "start", "--workspace=@dataspace/api"]
