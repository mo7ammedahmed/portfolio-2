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

# Full app code + vendor
COPY . .
COPY --from=vendor /app/vendor ./vendor

# Build-time dummy env for Wayfinder (if needed)
RUN if [ ! -f .env ]; then cp .env.example .env 2>/dev/null || echo "APP_KEY=base64:dummy" > .env; fi \
    && php artisan key:generate --force 2>/dev/null || true

RUN npm ci || npm install
RUN npm run build || echo "Frontend build skipped"

# ---------- Stage 3: Runtime image ----------
FROM php:8.4-fpm-alpine AS runtime

# System deps + PHP extensions
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
COPY --from=frontend /app/public/build ./public/build 2>/dev/null || echo "No build assets"

# Configure PHP-FPM to listen on port 9000
RUN echo "listen = 127.0.0.1:9000" > /usr/local/etc/php-fpm.d/zz-docker.conf \
    && echo "listen.allowed_clients = 127.0.0.1" >> /usr/local/etc/php-fpm.d/zz-docker.conf \
    && echo "user = www-data" >> /usr/local/etc/php-fpm.d/zz-docker.conf \
    && echo "group = www-data" >> /usr/local/etc/php-fpm.d/zz-docker.conf \
    && echo "clear_env = no" >> /usr/local/etc/php-fpm.d/zz-docker.conf \
    && echo "pm = dynamic" >> /usr/local/etc/php-fpm.d/zz-docker.conf \
    && echo "pm.max_children = 5" >> /usr/local/etc/php-fpm.d/zz-docker.conf \
    && echo "pm.start_servers = 2" >> /usr/local/etc/php-fpm.d/zz-docker.conf \
    && echo "pm.min_spare_servers = 1" >> /usr/local/etc/php-fpm.d/zz-docker.conf \
    && echo "pm.max_spare_servers = 3" >> /usr/local/etc/php-fpm.d/zz-docker.conf

# Nginx + Supervisor configs
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8080

ENTRYPOINT ["entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
