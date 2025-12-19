#!/bin/bash
# Setup SSL with Let's Encrypt

set -e

DOMAIN="bolajoon.uz"
EMAIL="admin@bolajoon.uz"

echo "=== Setting up SSL for $DOMAIN ==="

# Get SSL certificate
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL

# Test auto-renewal
certbot renew --dry-run

echo "=== SSL configured! ==="
echo "Your site is now available at https://$DOMAIN"