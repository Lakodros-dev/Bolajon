#!/bin/bash
# Configure Nginx for Bolajon.uz

set -e

DOMAIN="bolajoon.uz"

echo "=== Configuring Nginx for $DOMAIN ==="

# Create Nginx config
cat > /etc/nginx/sites-available/bolajon << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/bolajon /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test config
nginx -t

# Reload Nginx
systemctl reload nginx

echo "=== Nginx configured! ==="
echo ""
echo "Now run: certbot --nginx -d $DOMAIN -d www.$DOMAIN"