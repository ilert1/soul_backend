## Description

Backend for the SOUL application using NestJS, TypeScript, Prisma, PostgreSQL, Swagger, JWT, and Telegram Login.
Manages core API logic.

## Project Setup for Local Development

### 1. Install Dependencies

```bash
$ npm install
```

### 2. Start PostgreSQL (Docker)

```bash
# Start the services, rebuilds images if needed, and runs containers in the background.
$ docker compose -f 'docker-compose.yml' up -d --build
```

### 3. Create a .env file based on .env.example

Warning!
For easier authorization during development, if NODE_ENV === 'development', the validation check for the Telegram hash is disabled.

### 4. Apply existing Prisma Migrations

```bash
# Apply existing migrations for database without generating new ones.
$ npx prisma migrate deploy

# Apply existing migrations for schema.prisma.
$ npx prisma migrate dev
```

### 5. Compile and run the application

```bash
# Start the application in development mode (runs TypeScript directly, requires manual restart on changes)
$ npm run start

# Start the application in watch mode (automatically restarts on file changes, useful for development)
$ npm run start:dev

# Start the application in production mode (runs precompiled JS from the dist/ folder, no TypeScript compilation)
$ npm run start:prod
```

### 6.Run Tests

```bash
$ npm run test:e2e
```