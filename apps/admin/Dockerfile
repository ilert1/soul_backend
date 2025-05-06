FROM node:20-slim

WORKDIR /admin

RUN apt-get update -y && apt-get install -y openssl

COPY package.json package-lock.json ./

RUN  npm ci --only=production

COPY node_modules/.prisma/client ./node_modules/.prisma/client
COPY dist/ ./dist/
COPY .env ./
COPY tsconfig.json ./


CMD ["sh", "-c", "set -e; npm run admin:start"]
