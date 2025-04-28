FROM node:20-slim

WORKDIR /admin

RUN apt-get update -y && apt-get install -y openssl

COPY package.json ./

RUN npm i

COPY . .

CMD ["sh", "-c", "set -e; npm run admin:start"]
