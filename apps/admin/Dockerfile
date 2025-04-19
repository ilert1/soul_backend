FROM node:20-slim

WORKDIR /admin

COPY package.json ./

RUN npm i

COPY . .

RUN npm run admin:build

CMD ["sh", "-c", "npm run admin:start"]
