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
RUN apk add --no-cache php83 php83-tokenizer php83-xml php83-mbstring \
    php83-openssl php83-phar php83-dom php83-curl php83-fileinfo \
    php83-ctype php83-session php83-pdo php83-pdo_mysql php83-simplexml \
    && ln -s /usr/bin/php83 /usr/bin/php

WORKDIR /app
COPY package.json package-lock.json* yarn.lock* ./
RUN npm ci
COPY . .
COPY --from=composer-builder /app/vendor ./vendor

# ملف بيئة وهمي — فقط لتشغيل artisan أثناء البناء
RUN printf "APP_KEY=base64:dGVzdGtleXRlc3RrZXl0ZXN0a2V5dGVzdGtleT0=\nAPP_ENV=production\nDB_CONNECTION=sqlite\nDB_DATABASE=:memory:\n" > .env

RUN npm run build

# ==========================================
# Stage 3: Production Web Server
# ==========================================
FROM php:8.3-fpm-alpine
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
    libxml2-dev \
    icu-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd zip intl opcache

WORKDIR /var/www/html

COPY . .
COPY --from=composer-builder /app/vendor /var/www/html/vendor
COPY --from=frontend-builder /app/public/build /var/www/html/public/build

RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

RUN echo 'events { worker_connections 1024; } \n\
http { \n\
    include mime.types; \n\
    default_type application/octet-stream; \n\
    sendfile on; \n\
    keepalive_timeout 65; \n\
    server { \n\
        listen 80; \n\
        server_name _; \n\
        root /var/www/html/public; \n\
        add_header X-Frame-Options "SAMEORIGIN"; \n\
        add_header X-Content-Type-Options "nosniff"; \n\
        index index.php; \n\
        charset utf-8; \n\
        location / { try_files $uri $uri/ /index.php?$query_string; } \n\
        location = /favicon.ico { access_log off; log_not_found off; } \n\
        location = /robots.txt  { access_log off; log_not_found off; } \n\
        error_page 404 /index.php; \n\
        location ~ \.php$ { \n\
            fastcgi_pass 127.0.0.1:9000; \n\
            fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name; \n\
            include fastcgi_params; \n\
        } \n\
        location ~ /\.(?!well-known).* { deny all; } \n\
    } \n\
}' > /etc/nginx/nginx.conf

RUN echo '[supervisord] \n\
nodaemon=true \n\
user=root \n\
logfile=/dev/null \n\
logfile_maxbytes=0 \n\
\n\
[program:php-fpm] \n\
command=php-fpm -F \n\
stdout_logfile=/dev/stdout \n\
stdout_logfile_maxbytes=0 \n\
stderr_logfile=/dev/stderr \n\
stderr_logfile_maxbytes=0 \n\
\n\
[program:nginx] \n\
command=nginx -g "daemon off;" \n\
stdout_logfile=/dev/stdout \n\
stdout_logfile_maxbytes=0 \n\
stderr_logfile=/dev/stderr \n\
stderr_logfile_maxbytes=0' > /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
