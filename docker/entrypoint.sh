#!/bin/bash
set -e

cd /var/www/html

# Generate APP_KEY only if it's not already set via environment
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --force
fi

# Cache config/routes/views for production performance
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations automatically on deploy (safe to remove if you prefer manual control)
php artisan migrate --force

exec "$@"
