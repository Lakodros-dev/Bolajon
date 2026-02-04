#!/bin/bash

# Optimallashtirilgan VPS deploy script
# Faqat kerakli fayllarni yuklaydi

set -e

echo "🚀 VPS ga optimallashtirilgan deploy boshlandi..."

# VPS ma'lumotlari
VPS_USER="root"
VPS_HOST="185.196.214.76"
VPS_PATH="/var/www/bolajoon"
LOCAL_PATH="."

echo "📦 Fayllar tayyorlanmoqda..."

# Vaqtinchalik papka yaratish
TEMP_DIR="deploy_temp_$(date +%s)"
mkdir -p $TEMP_DIR

# Faqat kerakli fayllarni nusxalash
echo "📋 Kerakli fayllar nusxalanmoqda..."

# Asosiy fayllar
rsync -av --exclude-from='.deployignore' \
  --exclude='deploy_temp_*' \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='public/video' \
  --exclude='uploads' \
  --exclude='assets' \
  $LOCAL_PATH/ $TEMP_DIR/

# Hajmni tekshirish
DEPLOY_SIZE=$(du -sh $TEMP_DIR | cut -f1)
echo "📊 Deploy hajmi: $DEPLOY_SIZE"

# VPS ga yuklash
echo "⬆️  VPS ga yuklanmoqda..."
rsync -avz --delete \
  -e "ssh -o StrictHostKeyChecking=no" \
  $TEMP_DIR/ $VPS_USER@$VPS_HOST:$VPS_PATH/

# Vaqtinchalik papkani o'chirish
echo "🧹 Vaqtinchalik fayllar tozalanmoqda..."
rm -rf $TEMP_DIR

# VPS da build qilish
echo "🔨 VPS da build qilinmoqda..."
ssh $VPS_USER@$VPS_HOST << 'ENDSSH'
cd /var/www/bolajoon

# Node modules o'rnatish
echo "📦 Dependencies o'rnatilmoqda..."
npm install --production

# Build qilish
echo "🔨 Build qilinmoqda..."
npm run build

# PM2 ni restart qilish
echo "🔄 Ilova qayta ishga tushirilmoqda..."
pm2 restart bolajoon || pm2 start npm --name "bolajoon" -- start

# PM2 ni saqlash
pm2 save

echo "✅ VPS da build tugadi!"
ENDSSH

echo "✅ Deploy muvaffaqiyatli tugadi!"
echo "🌐 Sayt: https://bolajoon.uz"
