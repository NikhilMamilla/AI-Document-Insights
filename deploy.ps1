# AI Document Insight Tool - Windows Deployment Script
Write-Host "🚀 Deploying AI Document Insight Tool..." -ForegroundColor Green

# Check if Git is installed
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git not found. Please install Git first." -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites check passed!" -ForegroundColor Green

# Step 1: Deploy Backend to Heroku
Write-Host "`n📦 Step 1: Deploying Backend to Heroku..." -ForegroundColor Yellow

# Check if Heroku CLI is installed
if (!(Get-Command heroku -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Heroku CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   Download from: https://devcenter.heroku.com/articles/heroku-cli" -ForegroundColor Yellow
    exit 1
}

# Check if logged in to Heroku
try {
    heroku auth:whoami | Out-Null
    Write-Host "✅ Logged in to Heroku" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in to Heroku. Please run: heroku login" -ForegroundColor Red
    exit 1
}

# Create Heroku app
$APP_NAME = "ai-document-insights-backend"
try {
    heroku apps:info $APP_NAME | Out-Null
    Write-Host "✅ Using existing Heroku app: $APP_NAME" -ForegroundColor Green
} catch {
    Write-Host "📦 Creating new Heroku app: $APP_NAME" -ForegroundColor Yellow
    heroku create $APP_NAME
}

# Set environment variables
Write-Host "🔧 Setting environment variables..." -ForegroundColor Yellow
heroku config:set SARVAM_API_KEY="sk_s31uqtf7_G63rZ1YLhOKyhE8GKyi76xLQ" --app $APP_NAME
heroku config:set ALLOWED_ORIGINS="https://your-frontend-domain.vercel.app" --app $APP_NAME
heroku config:set MAX_FILE_SIZE="10485760" --app $APP_NAME

# Deploy backend
Write-Host "📤 Deploying backend to Heroku..." -ForegroundColor Yellow
Set-Location backend
git add .
git commit -m "Deploy backend to Heroku" -q
git push heroku main

# Get backend URL
$BACKEND_URL = "https://$APP_NAME.herokuapp.com"
Write-Host "✅ Backend deployed successfully!" -ForegroundColor Green
Write-Host "🔗 Backend URL: $BACKEND_URL" -ForegroundColor Cyan

# Step 2: Deploy Frontend to Vercel
Write-Host "`n🌐 Step 2: Deploying Frontend to Vercel..." -ForegroundColor Yellow

# Check if Vercel CLI is installed
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

# Check if logged in to Vercel
try {
    vercel whoami | Out-Null
    Write-Host "✅ Logged in to Vercel" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in to Vercel. Please run: vercel login" -ForegroundColor Red
    exit 1
}

# Update frontend environment
Set-Location ../Frontend
$envContent = "VITE_API_BASE=$BACKEND_URL"
$envContent | Out-File -FilePath ".env.production" -Encoding UTF8

Write-Host "🔧 Updated frontend environment with backend URL" -ForegroundColor Green

# Deploy frontend
Write-Host "📤 Deploying frontend to Vercel..." -ForegroundColor Yellow
vercel --prod --yes

Write-Host "`n🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "`n⚠️  IMPORTANT NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Update CORS origins in Heroku with your actual frontend URL" -ForegroundColor White
Write-Host "2. Test your deployed application!" -ForegroundColor White

Write-Host "`n🔗 Your deployed app should be accessible at the Vercel URL shown above" -ForegroundColor Cyan
