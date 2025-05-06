FROM node:20-slim

WORKDIR /backend

RUN apt-get update -y && apt-get install -y openssl

COPY package.json package-lock.json ./

RUN  npm ci --only=production

COPY prisma/ ./prisma/
COPY node_modules/.prisma ./node_modules/.prisma
COPY nest-cli.json ./
COPY dist/ ./dist/
COPY assets/ ./assets/
COPY .env ./
COPY tsconfig.json ./

CMD ["sh", "-c", "set -e; node dist/main.js"]
