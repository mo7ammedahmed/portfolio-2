#!/bin/bash
set -e

cd /var/www/html

echo "========================================="
echo "🚀 Starting container setup..."
echo "========================================="

# Generate APP_KEY if not set
if [ -z "$APP_KEY" ]; then
    echo "⚠️ APP_KEY not found, generating..."
    php artisan key:generate --force
else
    echo "✅ APP_KEY is set"
fi

# Clear all caches to avoid stale configuration
echo "🔄 Clearing caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Run migrations
echo "📦 Running migrations..."
php artisan migrate --force
php artisan db:seed

# Cache routes and views (config is NOT cached to allow env variables)
echo "🔄 Caching routes and views..."
php artisan route:cache
php artisan view:cache

echo "========================================="
echo "✅ Container is ready!"
echo "========================================="

# Start supervisord
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
