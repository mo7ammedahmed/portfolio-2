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

# Write Nginx Config inline
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

# Write Supervisor Config inline
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
