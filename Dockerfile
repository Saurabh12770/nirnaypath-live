# Multi-stage production Build for NirnayPath
# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Stage 2: Runtime Production
FROM node:20-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

USER node

CMD ["node", "app.js"]
