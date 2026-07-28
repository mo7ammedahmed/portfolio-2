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
COPY . .
COPY --from=vendor /app/vendor ./vendor

RUN if [ ! -f .env ]; then cp .env.example .env 2>/dev/null || echo "APP_KEY=base64:dummy" > .env; fi \
    && php artisan key:generate --force 2>/dev/null || true

RUN npm ci || npm install
RUN npm run build || echo "Frontend build skipped"

# ---------- Stage 3: Runtime image ----------
FROM php:8.4-fpm-alpine AS runtime

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

COPY . .
COPY --from=vendor /app/vendor ./vendor
COPY --from=frontend /app/public/build ./public/build

RUN echo "APP_KEY=base64:dummy" > .env

# PHP-FPM pool tuned for 512MB RAM
COPY .docker/www.conf /usr/local/etc/php-fpm.d/zz-docker.conf

# Custom php.ini (uploads, memory, opcache)
COPY .docker/php.ini /usr/local/etc/php/conf.d/zz-custom.ini

# Nginx + Supervisor configs
COPY .docker/nginx.conf /etc/nginx/nginx.conf
COPY .docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY .docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# nginx needs writable temp dirs for request bodies (file uploads),
# proxy buffering, fastcgi, etc. — create them and hand ownership to www-data,
# since nginx workers run as www-data per nginx.conf.
RUN mkdir -p /var/lib/nginx/tmp/client_body \
        /var/lib/nginx/tmp/proxy \
        /var/lib/nginx/tmp/fastcgi \
        /var/lib/nginx/tmp/uwsgi \
        /var/lib/nginx/tmp/scgi \
        /var/log/nginx \
    && chown -R www-data:www-data /var/lib/nginx /var/log/nginx

RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8080
ENTRYPOINT ["entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
