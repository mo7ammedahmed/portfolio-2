#!/bin/bash
set -e

# Wait for PHP-FPM to be ready
echo "⏳ Waiting for PHP-FPM to be ready..."
while ! nc -z 127.0.0.1 9000; do
    sleep 1
done
echo "✅ PHP-FPM is ready!"

# Start supervisord
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
