FROM node:20-slim

WORKDIR /backend

RUN apt-get update -y && apt-get install -y openssl

COPY package.json ./

RUN npm i

COPY . .

CMD ["sh", "-c", "set -e; npx prisma migrate deploy && npx prisma db seed && npm run build && npm run start"]
