#!/bin/bash

echo "🚀 Deploying AI Document Insight Tool Backend..."

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found. Please install it first:"
    echo "   https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo "❌ Not logged in to Heroku. Please run: heroku login"
    exit 1
fi

# Create Heroku app if it doesn't exist
APP_NAME="ai-document-insights-backend"
if ! heroku apps:info $APP_NAME &> /dev/null; then
    echo "📦 Creating new Heroku app: $APP_NAME"
    heroku create $APP_NAME
else
    echo "✅ Using existing Heroku app: $APP_NAME"
fi

# Set environment variables
echo "🔧 Setting environment variables..."
heroku config:set SARVAM_API_KEY="your_sarvam_api_key_here" --app $APP_NAME
heroku config:set ALLOWED_ORIGINS="https://your-frontend-domain.com" --app $APP_NAME
heroku config:set MAX_FILE_SIZE="10485760" --app $APP_NAME

# Deploy to Heroku
echo "📤 Deploying to Heroku..."
cd backend
git add .
git commit -m "Deploy backend to Heroku"
git push heroku main

# Open the app
echo "🌐 Opening deployed app..."
heroku open --app $APP_NAME

echo "✅ Backend deployed successfully!"
echo "🔗 Backend URL: https://$APP_NAME.herokuapp.com"
echo ""
echo "⚠️  IMPORTANT: Update your Sarvam API key in Heroku dashboard!"
echo "   Run: heroku config:set SARVAM_API_KEY='your_actual_api_key' --app $APP_NAME"
