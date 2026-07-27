# ---------- Stage 1: PHP dependencies (Composer) ----------
FROM composer:2 AS vendor

WORKDIR /app

COPY database/ database/
COPY composer.json composer.lock ./
RUN composer install \
    --no-interaction \
    --no-plugins \
    --no-scripts \
    --no-dev \
    --prefer-dist \
    --optimize-autoloader

# ---------- Stage 2: Build frontend assets (Vite/React) ----------
# Uses a PHP+Node image because Laravel Wayfinder runs `php artisan` during `npm run build`
FROM php:8.4-cli-alpine AS frontend

RUN apk add --no-cache \
        nodejs \
        npm \
        bash \
        icu-dev \
        libzip-dev \
        oniguruma-dev \
        freetype-dev \
        libjpeg-turbo-dev \
        libpng-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mbstring \
        zip \
        gd \
        intl \
        bcmath

WORKDIR /app

# Full app code + vendor (Wayfinder needs a bootable Laravel app to reflect routes)
COPY . .
COPY --from=vendor /app/vendor ./vendor

# Build-time only dummy env so the app can boot for Wayfinder's route reflection.
# This .env never ships in the final runtime image (frontend stage is discarded after build).
RUN if [ ! -f .env ]; then cp .env.example .env; fi \
    && php artisan key:generate --force

RUN npm ci
RUN npm run build

# ---------- Stage 3: Runtime image ----------
FROM php:8.4-fpm-alpine AS runtime

# System deps + PHP extensions Laravel typically needs
RUN apk add --no-cache \
        nginx \
        supervisor \
        bash \
        curl \
        libpng-dev \
        libzip-dev \
        oniguruma-dev \
        icu-dev \
        freetype-dev \
        libjpeg-turbo-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mbstring \
        zip \
        gd \
        intl \
        bcmath \
        opcache

WORKDIR /var/www/html

# App code
COPY . .

# Vendor from composer stage
COPY --from=vendor /app/vendor ./vendor

# Built frontend assets from node stage
COPY --from=frontend /app/public/build ./public/build

# Nginx + Supervisor config
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8080

ENTRYPOINT ["entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
