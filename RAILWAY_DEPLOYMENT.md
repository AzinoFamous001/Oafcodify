# Railway Deployment Guide for Oafcodify

This guide will help you deploy your Oafcodify application to Railway.app with all features preserved.

## Overview

The application is configured for Railway deployment using:
- **Docker containerization** for consistent deployment
- **Express server** serving both API and built frontend
- **MongoDB Atlas** for database (Railway also offers MongoDB, but Atlas is recommended)
- **All original features preserved**: authentication, OAuth, progress tracking, AI feedback, email reminders

## Prerequisites

- A Railway account (free tier available at [railway.app](https://railway.app))
- A MongoDB Atlas account (free tier available) OR use Railway's MongoDB service
- Google OAuth credentials
- GitHub OAuth credentials
- Gemini API key
- GitHub account (for Railway deployment)

## Step 1: Prepare MongoDB

### Option A: Use MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user with read/write permissions
4. Whitelist IP addresses (use `0.0.0.0/0` for all IPs)
5. Get your connection string from the "Connect" button
6. Format: `mongodb+srv://username:password@cluster.mongodb.net/oafcodify`

### Option B: Use Railway's MongoDB Service

1. After creating your Railway project, add a MongoDB service
2. Railway will provide a connection string in the service variables
3. Use this connection string as your `MONGODB_URI`

## Step 2: Get OAuth Credentials

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or use existing
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth client ID
5. Add authorized redirect URI: `https://your-app.railway.app/api/auth/google/callback`
6. Copy Client ID and Client Secret

### GitHub OAuth

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Set Homepage URL: `https://your-app.railway.app`
4. Set Authorization callback URL: `https://your-app.railway.app/api/auth/github/callback`
5. Copy Client ID and generate Client Secret

## Step 3: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com)
2. Create an API key
3. Copy the API key

## Step 4: Configure Email (Optional)

If you want to use email reminders:

1. Create a Gmail account or use existing
2. Enable 2-factor authentication
3. Generate an App Password (Google Account > Security > App Passwords)
4. Use the App Password as `EMAIL_PASS`

## Step 5: Deploy to Railway

### Using GitHub (Recommended)

1. Push your code to GitHub
2. Go to [Railway Dashboard](https://railway.app/dashboard)
3. Click "New Project" > "Deploy from GitHub repo"
4. Select your repository
5. Railway will automatically detect the Dockerfile and build configuration

### Using Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

## Step 6: Configure Environment Variables

Add these environment variables in Railway project settings (Variables tab):

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/oafcodify
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-app.railway.app/api/auth/google/callback
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://your-app.railway.app/api/auth/github/callback
GEMINI_API_KEY=your_gemini_api_key
SESSION_SECRET=your_random_secret_key
CLIENT_URL=https://your-app.railway.app
NODE_ENV=production
EMAIL_USER=your_email@gmail.com (optional)
EMAIL_PASS=your_app_password (optional)
```

**Important:** Replace `your-app.railway.app` with your actual Railway domain after deployment.

## Step 7: Update OAuth Callback URLs

After deployment, update your OAuth provider callback URLs:

1. **Google OAuth**: Update the authorized redirect URI to your Railway domain
2. **GitHub OAuth**: Update the Authorization callback URL to your Railway domain

## Architecture Differences

### Railway vs Vercel

**Vercel (Serverless Functions):**
- Individual API endpoints as serverless functions
- JWT-based stateless authentication
- No long-running processes

**Railway (Docker Container):**
- Single Express server handling all routes
- Session-based authentication with express-session
- Long-running process with cron jobs
- Serves both API and built frontend

### Features Preserved

All features work identically on Railway:

- ✅ User authentication (local, Google OAuth, GitHub OAuth)
- ✅ Session management with express-session
- ✅ MongoDB integration
- ✅ User progress tracking (quiz results, lesson progress, streaks)
- ✅ Gemini AI integration for quiz feedback
- ✅ Email notifications (automated via cron jobs)
- ✅ All original API endpoints

### Cron Jobs on Railway

Unlike Vercel, Railway supports long-running processes, so the automated daily email reminder cron job works out of the box:

```javascript
cron.schedule('0 9 * * *', async () => {
  // Daily study reminders at 9 AM
});
```

## Build Process

The Dockerfile handles the build process:

1. **Frontend Build**: Vite builds the React app to `dist/`
2. **Backend Setup**: Express server installed with production dependencies
3. **Static Serving**: Express serves built frontend from `dist/`
4. **API Routes**: All API routes handled by Express server
5. **SPA Fallback**: Non-API routes serve `index.html` for client-side routing

## Troubleshooting

### Build Errors

- Ensure Docker daemon is running if deploying locally
- Check that all dependencies are in package.json
- Verify Node.js version compatibility (Node.js 20.x)

### MongoDB Connection Errors

- Check IP whitelist in MongoDB Atlas
- Verify connection string format
- Ensure database user has correct permissions
- If using Railway MongoDB, check service variables

### OAuth Callback Errors

- Ensure callback URLs match exactly (including http/https)
- Check that environment variables are set correctly
- Verify OAuth app is not in test mode

### Session Issues

- Clear browser cookies if experiencing authentication issues
- Verify `SESSION_SECRET` is set in environment variables
- Check that session cookie settings are correct for production

### Port Issues

- Railway automatically assigns a port via `PORT` environment variable
- The Express server uses `process.env.PORT || 5000`
- No manual port configuration needed

## Local Development with Railway Configuration

To test locally with the same configuration:

1. Copy `.env.example` to `.env`
2. Fill in your environment variables
3. Run:
```bash
npm install
npm run build
npm start
```

The application will run on `http://localhost:5000` serving both frontend and API.

## Monitoring and Logs

Railway provides built-in monitoring:

- **Logs**: View real-time logs in Railway dashboard
- **Metrics**: CPU, memory, and network usage
- **Deployments**: Track deployment history and rollback if needed

## Scaling

Railway supports automatic scaling:

- **Free Tier**: Limited resources, good for development
- **Paid Plans**: More resources and better performance
- **Horizontal Scaling**: Add more instances as needed

## Cost Comparison

- **Railway Free Tier**: $5/month credit, sufficient for small apps
- **Vercel Hobby**: Free for personal projects
- **MongoDB Atlas Free**: 512MB storage
- **Paid plans available** for both platforms as needed

## Support

For issues specific to Railway deployment, check:
- [Railway Documentation](https://docs.railway.app)
- [Railway Community](https://community.railway.app)
- [Railway GitHub](https://github.com/railwayapp)

## Summary

The Railway deployment maintains all features of the original application:

- **Authentication**: Local, Google OAuth, GitHub OAuth
- **Database**: MongoDB with connection pooling
- **AI Integration**: Gemini API for quiz feedback
- **Email**: Automated reminders via cron jobs
- **Progress Tracking**: Quiz results, lessons, streaks
- **Session Management**: Express-session with secure cookies

The deployment uses Docker for consistency and supports all the original functionality including cron jobs, which were removed in the Vercel deployment.
