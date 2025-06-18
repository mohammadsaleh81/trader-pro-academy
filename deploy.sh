#!/bin/bash

set -e

echo "🚀 شروع فرآیند بیلد و استقرار..."

echo "1/4 - در حال بیلد کردن پروژه..."
npm run build

echo "2/4 - در حال حذف پوشه dist قدیمی از مسیر والد..."
rm -rf ../dist

echo "3/4 - در حال کپی کردن dist از سرور به مسیر والد..."
cp -r /var/www/academy/dist/ ../

echo "4/4 - در حال استقرار بیلد جدید در سرور..."
cp -r dist/ /var/www/academy/


systemctl restart nginx
echo "✅ فرآیند با موفقیت انجام شد."