#!/bin/bash

# Bolajon.uz - Tezkor muammoni hal qilish scripti
# ChunkLoadError muammosini hal qilish uchun

set -e

echo "🔧 Bolajon.uz - Tezkor tuzatish..."
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_DIR="/var/www/bolajon"
cd $PROJECT_DIR

echo -e "${YELLOW}⏸️  PM2'ni to'xtatish...${NC}"
pm2 stop bolajon
echo -e "${GREEN}✅ To'xtatildi${NC}"
echo ""

echo -e "${YELLOW}🧹 Cache'ni tozalash...${NC}"
rm -rf .next
rm -rf node_modules/.cache
rm -rf .next/cache
echo -e "${GREEN}✅ Cache tozalandi${NC}"
echo ""

echo -e "${YELLOW}🔨 Qayta build qilish...${NC}"
npm run build
echo -e "${GREEN}✅ Build tugadi${NC}"
echo ""

echo -e "${YELLOW}▶️  PM2'ni qayta ishga tushirish...${NC}"
pm2 start ecosystem.config.cjs
pm2 save
echo -e "${GREEN}✅ Ishga tushdi${NC}"
echo ""

echo -e "${YELLOW}🔄 Nginx'ni qayta yuklash...${NC}"
sudo systemctl reload nginx
echo -e "${GREEN}✅ Nginx qayta yuklandi${NC}"
echo ""

echo -e "${GREEN}✅ Tuzatish tugadi!${NC}"
echo ""
echo "📊 Tekshirish:"
echo "  pm2 logs bolajon --lines 50"
echo "  curl -I https://bolajoon.uz"
