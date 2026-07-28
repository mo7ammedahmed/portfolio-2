#!/bin/bash
set -e
cd /var/www/html

echo "========================================="
echo "🚀 Starting container setup..."
echo "========================================="

if [ -z "$APP_KEY" ]; then
    echo "❌ ERROR: APP_KEY environment variable is not set!"
    exit 1
else
    echo "✅ APP_KEY is set via environment"
fi

echo "🔄 Clearing caches..."
php artisan config:clear 2>/dev/null || echo "⚠️ Config clear skipped"
php artisan route:clear 2>/dev/null || echo "⚠️ Route clear skipped"
php artisan view:clear 2>/dev/null || echo "⚠️ View clear skipped"
php artisan cache:clear 2>/dev/null || echo "⚠️ Cache clear skipped"

echo "🔗 Linking storage..."
php artisan storage:link 2>/dev/null || echo "⚠️ Storage link skipped (may already exist)"

echo "📦 Running migrations..."
php artisan migrate --force || echo "⚠️ Migrations failed, continuing..."

echo "🔄 Caching config, routes and views..."
php artisan config:cache 2>/dev/null || echo "⚠️ Config cache skipped"
php artisan route:cache 2>/dev/null || echo "⚠️ Route cache skipped"
php artisan view:cache 2>/dev/null || echo "⚠️ View cache skipped"

echo "========================================="
echo "✅ Container is ready!"
echo "========================================="

echo "⏳ Waiting for PHP-FPM to be ready..."
sleep 3

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
