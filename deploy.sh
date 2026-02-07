#!/bin/bash

# DataSpace Connect Deployment Script
set -e

echo "🚀 Starting DataSpace Connect Build & Deployment Pipeline"

# Prompt for Environment
echo "Select Target Environment:"
select ENV in "Staging" "Production"; do
    case $ENV in
        Staging|Production) break;;
        *) echo "Invalid selection";;
    esac
done

echo "Building for $ENV environment..."

# 1. Install Dependencies
echo "📦 Installing root and workspace dependencies..."
npm install

# 2. Build Common Package
echo "🛠️ Building @dataspace/common..."
npm run build --workspace=@dataspace/common

# 3. Build Backend API
echo "🖥️ Building @dataspace/api..."
npm run build --workspace=@dataspace/api

# 4. Build Frontend & Sync Mobile
echo "📱 Building @dataspace/web..."
cd packages/web
npm run build

echo "🔄 Syncing with Capacitor iOS..."
npx cap copy ios
npx cap sync ios

echo "✅ Build Completed Successfully!"

if [ "$ENV" == "Production" ]; then
    echo "⚠️  REMINDER: Ensure production.env is configured before starting the API container."
    echo "💡 Run 'npx cap open ios' to launch Xcode for final archiving."
fi
