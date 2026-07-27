#!/bin/bash
set -e

cd /var/www/html

# Generate APP_KEY only if it's not already set via environment
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --force
fi

# Clear any old cache FIRST
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Run migrations FIRST (before caching)
php artisan migrate --force
php artisan db:seed

# THEN cache everything AFTER migrations
php artisan config:cache
php artisan route:cache
php artisan view:cache

exec "$@"
