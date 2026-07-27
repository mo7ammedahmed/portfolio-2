#!/bin/bash
set -e

cd /var/www/html

echo "========================================="
echo "🚀 Starting container setup..."
echo "========================================="

# Check if APP_KEY is set
if [ -z "$APP_KEY" ]; then
    echo "❌ ERROR: APP_KEY environment variable is not set!"
    exit 1
else
    echo "✅ APP_KEY is set via environment"
fi

# Clear caches (ignore errors)
echo "🔄 Clearing caches..."
php artisan config:clear 2>/dev/null || echo "⚠️ Config clear skipped"
php artisan route:clear 2>/dev/null || echo "⚠️ Route clear skipped" 
php artisan view:clear 2>/dev/null || echo "⚠️ View clear skipped"
php artisan cache:clear 2>/dev/null || echo "⚠️ Cache clear skipped"

# Run migrations
echo "📦 Running migrations..."
php artisan migrate --force || echo "⚠️ Migrations failed, continuing..."

# Cache routes and views
echo "🔄 Caching routes and views..."
php artisan route:cache 2>/dev/null || echo "⚠️ Route cache skipped"
php artisan view:cache 2>/dev/null || echo "⚠️ View cache skipped"

echo "========================================="
echo "✅ Container is ready!"
echo "========================================="

# Wait for PHP-FPM to be ready before starting services
echo "⏳ Waiting for PHP-FPM to be ready..."
sleep 3

# Start supervisord
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
