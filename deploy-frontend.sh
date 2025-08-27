#!/bin/bash

echo "🚀 Deploying AI Document Insight Tool Frontend..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it first:"
    echo "   npm install -g vercel"
    exit 1
fi

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Please run: vercel login"
    exit 1
fi

# Update environment variables
echo "🔧 Updating environment variables..."
cd Frontend

# Create production .env file
cat > .env.production << EOF
VITE_API_BASE=https://your-backend-domain.com
EOF

echo "⚠️  IMPORTANT: Update the API base URL in .env.production with your actual backend URL!"

# Deploy to Vercel
echo "📤 Deploying to Vercel..."
vercel --prod

echo "✅ Frontend deployed successfully!"
echo ""
echo "⚠️  IMPORTANT: Update your backend URL in the deployed environment!"
echo "   Go to Vercel dashboard and update the VITE_API_BASE environment variable"
