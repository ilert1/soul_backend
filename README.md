# Описание

Репозиторий бэкенда для TMA приложения SOUL. Бэкенд состоит из трех частей:

1. База данных - PostgreSQL - поднимается в своем контейнере Docker
2. Собственно бэкенд - NestJS, PrismaORM - находится в ./apps/backend. При деплое поднимается в своем контейнере Docker
3. Панель администратора - AdminJS - находится в ./apps/admin. При деплое поднимается в своем контейнере Docker

# Настройка проекта для локальной разработки

## 1. Запустите PostgreSQL (Docker)

```bash
# Запуск сервисов, пересборка образов при необходимости и запуск контейнеров в фоновом режиме.
$ docker compose -f 'docker-compose.yml' up -d --build
```

## 2. Установите зависимости (отдельные для backend и admin)

```bash
$ cd apps/backend && npm install && cd ../admin && npm install  && cd ../..
```

## 3. Создайте файл .env на основе .env.example (отдельные для backend и admin)

```bash
$ cp apps/backend/.env.example apps/backend/.env && cp apps/admin/.env.example apps/admin/.env
```

Внимание!  
Для упрощения авторизации во время разработки, если apps/backend/.env.NODE_ENV === 'development', проверка Telegram хеша отключена. И можно будет получить JWToken при любом запросе авторизации

## 4. Создайте клиент призмы, примените существующие миграции Prisma, запустите сидирование

Схема призмы и миграции находятся в apps/backend/prisma. Сиды находятся в apps/backend/src/seeds
Но при генерации клиент призмы создается и в ../admin/node_modules/.prisma и в ../backend/node_modules/.prisma

```bash
$ npx prisma generate && npx prisma migrate deploy && npx prisma db seed
```

## 5. Скомпилируйте и запустите приложение

### 5.1. Запуск собственно бэкенда

```bash
# Запуск билда и запуска приложения бэкенда в  режиме --watch
$ cd apps/backend && npm run start:dev
```

После запуска документация будет доступна по http://localhost:3000/docs#/

### 5.2. Запуск панели администрации

```bash
# Запуск билда и запуска приложения панели администратора в  режиме --watch
$ cd apps/admin && npm run admin:dev
```

После запуска панель администраттора будет доступна по http://localhost:3000/admin/

## 6. Запустите тесты перед сдачей pull request

```bash
# Запуск e2e и unit тестов
$ cd apps/backrnd && npm run test:dev
```
