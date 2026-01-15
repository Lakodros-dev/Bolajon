#!/bin/bash

# Bolajon.uz - VPS Deployment Script
# Bu scriptni VPS'da ishga tushiring

set -e  # Xatolik bo'lsa to'xtatish

echo "🚀 Bolajon.uz deployment boshlandi..."
echo ""

# Ranglar
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Loyiha papkasi
PROJECT_DIR="/var/www/bolajon"
cd $PROJECT_DIR

echo -e "${YELLOW}📥 Git'dan yangilanishlarni olish...${NC}"
git pull origin main
echo -e "${GREEN}✅ Git pull tugadi${NC}"
echo ""

echo -e "${YELLOW}📦 Dependencies o'rnatilmoqda...${NC}"
npm install --production
echo -e "${GREEN}✅ Dependencies o'rnatildi${NC}"
echo ""

echo -e "${YELLOW}🧹 Cache tozalanmoqda...${NC}"
rm -rf .next
rm -rf node_modules/.cache
echo -e "${GREEN}✅ Cache tozalandi${NC}"
echo ""

echo -e "${YELLOW}🔨 Build qilinmoqda...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build muvaffaqiyatli${NC}"
else
    echo -e "${RED}❌ Build xatolik bilan yakunlandi${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}🔄 PM2 qayta ishga tushirilmoqda...${NC}"
pm2 restart bolajon
pm2 save
echo -e "${GREEN}✅ PM2 qayta ishga tushdi${NC}"
echo ""

echo -e "${YELLOW}🔄 Nginx qayta yuklanmoqda...${NC}"
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx qayta yuklandi${NC}"
else
    echo -e "${RED}❌ Nginx konfiguratsiyasida xatolik${NC}"
fi
echo ""

echo -e "${GREEN}✅ Deployment tugadi!${NC}"
echo -e "${GREEN}🌐 Sayt: https://bolajoon.uz${NC}"
echo ""
echo "📊 Status tekshirish:"
echo "  pm2 status"
echo "  pm2 logs bolajon"
