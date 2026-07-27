# ==========================================
# Stage 1: Install PHP Composer Dependencies
# ==========================================
FROM composer:2 AS composer-builder
WORKDIR /app
COPY composer.json composer.lock* ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts

# ==========================================
# Stage 2: Build Frontend Assets (Vite / React)
# ==========================================
FROM node:20-alpine AS frontend-builder
# لازم PHP هنا لأن vite-plugin-wayfinder يشغّل artisan أثناء البناء
RUN apk add --no-cache php83 php83-tokenizer php83-xml php83-mbstring \
    php83-openssl php83-phar php83-dom php83-curl php83-fileinfo \
    php83-ctype php83-session php83-pdo php83-pdo_mysql php83-simplexml \
    && ln -s /usr/bin/php83 /usr/bin/php

WORKDIR /app
COPY package.json package-lock.json* yarn.lock* ./
RUN npm ci
COPY . .
COPY --from=composer-builder /app/vendor ./vendor

# wayfinder:generate يحتاج .env و APP_KEY صالحين حتى يقلع Laravel
RUN cp .env.example .env \
    && php artisan key:generate --ansi

RUN npm run build

# ==========================================
# Stage 3: Production Web Server
# ==========================================
FROM php:8.3-fpm-alpine
...
