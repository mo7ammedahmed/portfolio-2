# ==========================================
# Stage 1: Build Frontend Assets (Vite / React)
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Copy package files and install JS dependencies
COPY package.json package-lock.json* yarn.lock* ./
RUN npm ci

# Copy full application code and build static assets
COPY . .
RUN npm run build

# ==========================================
# Stage 2: Install PHP Composer Dependencies
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
# Stage 3: Production Web Server
# ==========================================
FROM php:8.3-fpm-alpine

# Install system dependencies & PHP extensions
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    zip \
    unzip \
    oniguruma-dev \
    icui18n \
    libxml2-dev \
    icu-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd zip intl opcache

WORKDIR /var/www/html

# Copy application code
COPY . .

# Copy built vendor directory from Composer stage
COPY --from=composer-builder /app/vendor /var/www/html/vendor

# Copy compiled frontend assets from Node stage
COPY --from=frontend-builder /app/public/build /var/www/html/public/build

# Set permissions for Laravel storage and cache
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Copy Nginx & Supervisor configuration files
COPY .docker/nginx.conf /etc/nginx/nginx.conf
COPY .docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]