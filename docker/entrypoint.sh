#!/bin/bash
set -e

cd /var/www/html

echo "========================================="
echo "🚀 Starting container setup..."
echo "========================================="

# APP_KEY must be set via environment
if [ -z "$APP_KEY" ]; then
    echo "❌ ERROR: APP_KEY environment variable is not set!"
    echo "Please set APP_KEY in your Render environment variables."
    exit 1
else
    echo "✅ APP_KEY is set via environment"
fi

# Clear all caches
echo "🔄 Clearing caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Run migrations
echo "📦 Running migrations..."
php artisan migrate --force

# Cache routes and views only (config is NOT cached)
echo "🔄 Caching routes and views..."
php artisan route:cache
php artisan view:cache

echo "========================================="
echo "✅ Container is ready!"
echo "========================================="

# Start supervisord
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
