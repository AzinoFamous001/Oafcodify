# Vercel Deployment Guide for Oafcodify

This guide explains how to deploy the Oafcodify application to Vercel with all features preserved.

## Overview

The application has been converted from a traditional Express server to Vercel serverless functions. All features remain intact:

- ✅ User authentication (local, Google OAuth, GitHub OAuth)
- ✅ JWT-based session management (serverless-compatible)
- ✅ MongoDB integration with connection caching
- ✅ User progress tracking (quiz results, lesson progress, streaks)
- ✅ Gemini AI integration for quiz feedback
- ✅ Email notifications (manual trigger via API)
- ✅ All original API endpoints converted to serverless functions

## Architecture Changes

### Before (Express Server)
- Long-running Express server in `Server/server.js`
- Session management with express-session (memory store)
- Cron jobs for automated email reminders
- All routes handled by a single server process

### After (Vercel Serverless)
- Individual serverless functions in `api/` directory
- JWT-based session management (stateless, serverless-compatible)
- Manual email reminder API (cron jobs removed - Vercel doesn't support them)
- Each API endpoint is a separate serverless function

## New Serverless Functions

### Authentication
- `api/auth/register.js` - User registration with password hashing
- `api/auth/login.js` - User login with JWT token generation
- `api/auth/logout.js` - User logout with token clearing
- `api/auth/user.js` - Get current authenticated user
- `api/auth/google.js` - Google OAuth initiation
- `api/auth/google/callback.js` - Google OAuth callback with JWT
- `api/auth/github.js` - GitHub OAuth initiation
- `api/auth/github/callback.js` - GitHub OAuth callback with JWT

### User Progress
- `api/user/progress/[userId].js` - Get/update user progress
- `api/user/quiz-result/[userId].js` - Save quiz results
- `api/user/lesson-progress/[userId].js` - Update lesson progress
- `api/user/streak/[userId].js` - Update user streak
- `api/user/notification/[userId].js` - Add notifications
- `api/user/profile/[userId].js` - Update user profile

### Features
- `api/quiz-feedback.js` - Gemini AI quiz feedback
- `api/gemini.js` - General Gemini AI endpoint
- `api/send-study-reminder.js` - Email reminder (manual)
- `api/health.js` - Health check endpoint
- `api/db.js` - MongoDB connection with caching

### Utilities
- `api/lib/jwt.js` - JWT token generation and verification

## Deployment Steps

### 1. Prepare MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user with read/write permissions
4. Whitelist IP addresses (use `0.0.0.0/0` for all IPs)
5. Get your connection string from the "Connect" button
6. Format: `mongodb+srv://username:password@cluster.mongodb.net/oafcodify`

### 2. Configure OAuth Providers

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or use existing
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth client ID
5. Add authorized redirect URI: `https://your-app.vercel.app/api/auth/google/callback`
6. Copy Client ID and Client Secret

#### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Set Homepage URL: `https://your-app.vercel.app`
4. Set Authorization callback URL: `https://your-app.vercel.app/api/auth/github/callback`
5. Copy Client ID and generate Client Secret

### 3. Configure Email (Optional)

If you want to use email reminders:
1. Create a Gmail account or use existing
2. Enable 2-factor authentication
3. Generate an App Password (Google Account > Security > App Passwords)
4. Use the App Password as `EMAIL_PASS`

### 4. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

#### Option B: Using Vercel Dashboard

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure environment variables

### 5. Configure Environment Variables

Add these in Vercel project settings (Settings > Environment Variables):

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/oafcodify
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-app.vercel.app/api/auth/google/callback
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://your-app.vercel.app/api/auth/github/callback
GEMINI_API_KEY=your_gemini_api_key
SESSION_SECRET=your_random_secret_key
CLIENT_URL=https://your-app.vercel.app
NODE_ENV=production
EMAIL_USER=your_email@gmail.com (optional)
EMAIL_PASS=your_app_password (optional)
```

**Important:** Replace `your-app.vercel.app` with your actual Vercel domain after deployment.

### 6. Update OAuth Callback URLs

After deployment, update your OAuth provider callback URLs:

1. **Google OAuth**: Update the authorized redirect URI to your Vercel domain
2. **GitHub OAuth**: Update the Authorization callback URL to your Vercel domain

## API Endpoint Changes

All API endpoints remain the same, but are now served as serverless functions:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/user` - Get current user
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/github` - Initiate GitHub OAuth
- `GET /api/auth/github/callback` - GitHub OAuth callback

### User Progress
- `GET /api/user/progress/[userId]` - Get user progress
- `POST /api/user/progress/[userId]` - Update user progress
- `POST /api/user/quiz-result/[userId]` - Save quiz result
- `POST /api/user/lesson-progress/[userId]` - Update lesson progress
- `POST /api/user/streak/[userId]` - Update streak
- `POST /api/user/notification/[userId]` - Add notification
- `PUT /api/user/profile/[userId]` - Update profile

### Features
- `POST /api/quiz-feedback` - Get AI quiz feedback
- `POST /api/gemini` - General Gemini AI endpoint
- `POST /api/send-study-reminder` - Send email reminder
- `GET /api/health` - Health check

## Session Management

The application now uses JWT (JSON Web Tokens) for session management instead of express-session:

- **Token Storage**: HTTP-only cookies
- **Token Expiration**: 24 hours
- **Token Verification**: Verified on each authenticated request
- **Security**: Tokens are signed with `SESSION_SECRET`

This approach is stateless and works perfectly with Vercel's serverless architecture.

## Important Notes

### Cron Jobs Removed
The automated daily email reminder cron job has been removed because Vercel doesn't support long-running processes. If you need automated reminders, consider:

1. Using Vercel Cron Jobs (Pro plan)
2. Using an external cron service (e.g., cron-job.org) to call the `/api/send-study-reminder` endpoint
3. Implementing a separate worker service

### Local Development
To run locally with the same configuration:

1. Copy `.env.example` to `.env`
2. Fill in your environment variables
3. Run:
```bash
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` and API calls will go to the Vercel serverless functions (if deployed) or you can test locally using the Express server in `Server/server.js`.

### Testing Before Deployment
Test all features locally before deploying:

1. User registration and login
2. Google OAuth authentication
3. GitHub OAuth authentication
4. Quiz functionality and AI feedback
5. Progress tracking
6. Email reminders (manual)

## Troubleshooting

### OAuth Callback Errors
- Ensure callback URLs match exactly (including http/https)
- Check that environment variables are set correctly
- Verify OAuth app is not in test mode

### MongoDB Connection Errors
- Check IP whitelist in MongoDB Atlas
- Verify connection string format
- Ensure database user has correct permissions

### Build Errors
- Ensure all dependencies are in package.json
- Check that Node.js version is compatible (Node.js 20.x)
- Review build logs in Vercel dashboard

### Session Issues
- Clear browser cookies if experiencing authentication issues
- Verify `SESSION_SECRET` is set in environment variables
- Check that JWT tokens are being set in cookies

## Support

For issues specific to Vercel deployment, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://vercel.com/community)

## Summary of Changes

### Files Created
- `api/lib/jwt.js` - JWT utility functions
- `api/auth/register.js` - Registration endpoint
- `api/auth/login.js` - Login endpoint
- `api/auth/logout.js` - Logout endpoint (updated)
- `api/auth/user.js` - User endpoint (updated)
- `api/auth/google/callback.js` - Google callback (updated)
- `api/auth/github/callback.js` - GitHub callback (updated)
- `api/user/progress/[userId].js` - Progress endpoint
- `api/user/quiz-result/[userId].js` - Quiz result endpoint
- `api/user/lesson-progress/[userId].js` - Lesson progress endpoint
- `api/user/streak/[userId].js` - Streak endpoint
- `api/user/notification/[userId].js` - Notification endpoint
- `api/user/profile/[userId].js` - Profile endpoint
- `api/quiz-feedback.js` - Quiz feedback endpoint
- `api/send-study-reminder.js` - Email reminder endpoint

### Files Updated
- `vercel.json` - Added runtime configuration and CORS headers
- `package.json` - Added jsonwebtoken and bcryptjs dependencies

### Files Preserved (No Changes)
- `Server/server.js` - Kept for local development
- `Server/models/User.js` - User model unchanged
- `Server/config/database.js` - Database config unchanged
- All frontend code in `src/` - No changes
- All existing API functions in `api/` - Enhanced but compatible

All features work exactly as before, just adapted for Vercel's serverless architecture.
