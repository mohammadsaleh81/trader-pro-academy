#!/bin/bash

# Frontend deployment script for academy.gport.sbs
echo "🚀 Starting frontend deployment..."

# Build the project
echo "📦 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Copy files to nginx directory
echo "📂 Copying files to /var/www/academy/..."
sudo rm -rf /var/www/academy/dist
sudo cp -r dist /var/www/academy/

# Set proper permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data /var/www/academy

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
sudo nginx -t

if [ $? -ne 0 ]; then
    echo "❌ Nginx configuration test failed!"
    exit 1
fi

# Reload nginx
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

echo "✅ Frontend deployment completed successfully!"
echo "🌐 Website is available at: https://academy.gport.sbs" 