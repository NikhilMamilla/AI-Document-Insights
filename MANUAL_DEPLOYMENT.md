# 🚀 Manual Deployment Guide

## ✅ Frontend Status: DEPLOYED
**URL**: https://ai-document-insights-2kg0014i0-nikhilmamillas-projects.vercel.app

## 🔧 Backend Deployment Options

### Option 1: Render.com (Recommended - Free, No Credit Card)

1. **Go to**: https://render.com
2. **Sign up** with your GitHub account
3. **Click "New +"** → "Web Service"
4. **Connect your GitHub repository** (you'll need to push to GitHub first)
5. **Configure the service**:
   - **Name**: `ai-document-insights-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. **Add Environment Variables**:
   - `SARVAM_API_KEY` = `sk_s31uqtf7_G63rZ1YLhOKyhE8GKyi76xLQ`
   - `ALLOWED_ORIGINS` = `https://ai-document-insights-2kg0014i0-nikhilmamillas-projects.vercel.app`
   - `MAX_FILE_SIZE` = `10485760`
7. **Click "Create Web Service"**

### Option 2: Railway.com (Alternative)

1. **Go to**: https://railway.app
2. **Sign up** with your GitHub account
3. **Click "New Project"** → "Deploy from GitHub repo"
4. **Select your repository** and the `backend` folder
5. **Add Environment Variables** in Railway dashboard:
   - `SARVAM_API_KEY` = `sk_s31uqtf7_G63rZ1YLhOKyhE8GKyi76xLQ`
   - `ALLOWED_ORIGINS` = `https://ai-document-insights-2kg0014i0-nikhilmamillas-projects.vercel.app`
   - `MAX_FILE_SIZE` = `10485760`

### Option 3: Push to GitHub First

If you want to push to GitHub first:

```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository at https://github.com/new
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## 🔗 Connect Frontend to Backend

After deploying the backend, you'll get a URL like:
- Render: `https://your-app-name.onrender.com`
- Railway: `https://your-app-name.railway.app`

**Update the frontend environment variable**:

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: `ai-document-insights`
3. Go to Settings → Environment Variables
4. Add: `VITE_API_BASE` = `YOUR_BACKEND_URL`
5. Redeploy the frontend

## 🎉 Success!

Once both are deployed and connected, your app will work exactly like localhost!

**Frontend**: https://ai-document-insights-2kg0014i0-nikhilmamillas-projects.vercel.app
**Backend**: (Your deployed backend URL)

## 🔍 Troubleshooting

- **CORS Errors**: Make sure `ALLOWED_ORIGINS` includes your frontend URL
- **API Key Errors**: Verify `SARVAM_API_KEY` is set correctly
- **Build Errors**: Check that all dependencies are in `requirements.txt`
