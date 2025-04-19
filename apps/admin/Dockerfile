FROM node:20-slim

WORKDIR /admin

RUN apt-get update -y && apt-get install -y openssl

COPY package.json ./

RUN npm i

COPY . .

RUN npm run admin:build

CMD ["sh", "-c", "npm run admin:start"]
