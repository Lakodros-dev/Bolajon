#!/bin/bash
# Start Bolajon.uz with PM2

set -e

cd /var/www/bolajon

echo "=== Starting Bolajon.uz ==="

# Stop existing if running
pm2 delete bolajon 2>/dev/null || true

# Start with PM2
pm2 start npm --name "bolajon" -- start

# Save PM2 config
pm2 save

# Setup PM2 to start on boot
pm2 startup

echo "=== App started! ==="
echo "Check status: pm2 status"
echo "View logs: pm2 logs bolajon"