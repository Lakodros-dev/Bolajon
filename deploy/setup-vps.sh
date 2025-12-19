#!/bin/bash
# Bolajon.uz VPS Setup Script
# Run as root on Ubuntu/Debian

set -e

echo "=== Bolajon.uz VPS Setup ==="

# 1. System update
echo ">>> Updating system..."
apt update && apt upgrade -y

# 2. Install Node.js 20
echo ">>> Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 3. Install PM2
echo ">>> Installing PM2..."
npm install -g pm2

# 4. Install Nginx
echo ">>> Installing Nginx..."
apt install -y nginx

# 5. Install Certbot for SSL
echo ">>> Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# 6. Create app directory
echo ">>> Creating app directory..."
mkdir -p /var/www/bolajon
cd /var/www/bolajon

# 7. Clone repository
echo ">>> Cloning repository..."
git clone https://github.com/Lakodros-dev/Bolajon.git .

# 8. Install dependencies
echo ">>> Installing dependencies..."
npm install

# 9. Create .env.local file
echo ">>> Creating .env.local..."
cat > .env.local << 'EOF'
# MongoDB Connection String
MONGODB_URI=mongodb+srv://your-mongodb-uri

# JWT Configuration
JWT_SECRET=bolajon-super-secret-key-2024-production-change-this

# App Configuration
NEXT_PUBLIC_APP_NAME=Bolajon.uz
NEXT_PUBLIC_APP_URL=https://bolajoon.uz
EOF

echo ""
echo "!!! IMPORTANT: Edit /var/www/bolajon/.env.local with your MongoDB URI !!!"
echo ""

# 10. Build the app
echo ">>> Building the app..."
npm run build

echo "=== Setup complete! Run deploy/start-app.sh next ==="