# 🚀 AI Document Insight Tool - Deployment Guide

This guide will help you deploy the AI Document Insight Tool to work exactly like it does on localhost.

## 📋 Prerequisites

1. **GitHub Account** - For code hosting
2. **Heroku Account** - For backend deployment (free tier available)
3. **Vercel Account** - For frontend deployment (free tier available)
4. **Sarvam AI API Key** - For AI processing

## 🏗️ Architecture

- **Backend**: FastAPI on Heroku
- **Frontend**: React + Vite on Vercel
- **Database**: SQLite (local to Heroku)
- **File Storage**: Local storage on Heroku
- **AI Service**: Sarvam AI API

## 🚀 Step-by-Step Deployment

### 1. Backend Deployment (Heroku)

#### Option A: Using the Deployment Script
```bash
# Make script executable
chmod +x deploy-backend.sh

# Run deployment
./deploy-backend.sh
```

#### Option B: Manual Deployment
```bash
# Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create new app
heroku create ai-document-insights-backend

# Set environment variables
heroku config:set SARVAM_API_KEY="your_actual_sarvam_api_key"
heroku config:set ALLOWED_ORIGINS="https://your-frontend-domain.vercel.app"
heroku config:set MAX_FILE_SIZE="10485760"

# Deploy
cd backend
git add .
git commit -m "Deploy backend"
git push heroku main

# Open app
heroku open
```

### 2. Frontend Deployment (Vercel)

#### Option A: Using the Deployment Script
```bash
# Make script executable
chmod +x deploy-frontend.sh

# Run deployment
./deploy-frontend.sh
```

#### Option B: Manual Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd Frontend
vercel --prod
```

### 3. Connect Frontend to Backend

After both deployments, update the frontend environment:

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add: `VITE_API_BASE` = `https://your-backend-app.herokuapp.com`

## 🔧 Environment Variables

### Backend (Heroku)
```bash
SARVAM_API_KEY=your_sarvam_api_key_here
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
MAX_FILE_SIZE=10485760
```

### Frontend (Vercel)
```bash
VITE_API_BASE=https://your-backend-app.herokuapp.com
```

## 📁 File Structure After Deployment

```
ai-document-insights/
├── backend/                 # Heroku deployment
│   ├── main.py
│   ├── ai_service.py
│   ├── requirements.txt
│   ├── Procfile
│   └── runtime.txt
├── Frontend/               # Vercel deployment
│   ├── src/
│   ├── package.json
│   └── vercel.json
├── deploy-backend.sh
├── deploy-frontend.sh
└── DEPLOYMENT.md
```

## 🔍 Troubleshooting

### Backend Issues
1. **API Key Error**: Check `SARVAM_API_KEY` in Heroku config
2. **CORS Error**: Update `ALLOWED_ORIGINS` with your frontend URL
3. **File Upload Error**: Check `MAX_FILE_SIZE` setting

### Frontend Issues
1. **API Connection Error**: Verify `VITE_API_BASE` points to your backend
2. **Build Error**: Check Vercel build logs
3. **CORS Error**: Ensure backend allows your frontend domain

### Common Commands
```bash
# Check Heroku logs
heroku logs --tail

# Check Vercel logs
vercel logs

# Update environment variables
heroku config:set VARIABLE_NAME="value"
```

## 🌐 URLs After Deployment

- **Backend**: `https://your-app-name.herokuapp.com`
- **Frontend**: `https://your-app-name.vercel.app`

## 🔒 Security Notes

1. **API Key**: Never commit your Sarvam API key to Git
2. **CORS**: Only allow your frontend domain in production
3. **File Size**: Set appropriate limits for your use case

## 📞 Support

If you encounter issues:
1. Check the logs: `heroku logs --tail` or Vercel dashboard
2. Verify environment variables are set correctly
3. Ensure all dependencies are in requirements.txt/package.json

## 🎉 Success!

Once deployed, your app will work exactly like localhost but accessible from anywhere on the internet!
