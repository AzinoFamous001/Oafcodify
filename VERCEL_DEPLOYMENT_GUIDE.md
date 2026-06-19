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

## Serverless Functions (Consolidated to 11 functions)

### Authentication (4 functions)
- `api/auth/register.js` - User registration with password hashing
- `api/auth/login.js` - User login with JWT token generation
- `api/auth/logout.js` - User logout with token clearing
- `api/auth/user.js` - Get current authenticated user
- `api/auth/google.js` - Google OAuth (initiation and callback via action parameter)
- `api/auth/github.js` - GitHub OAuth (initiation and callback via action parameter)

### User Progress (1 function)
- `api/user/[userId].js` - Consolidated endpoint for all user operations:
  - GET/POST: Progress tracking
  - POST: Quiz results (action=quiz-result)
  - POST: Lesson progress (action=lesson-progress)
  - POST: Streak updates (action=streak)
  - POST: Notifications (action=notification)
  - PUT: Profile updates (action=profile)

### Features (4 functions)
- `api/quiz-feedback.js` - Gemini AI quiz feedback
- `api/gemini.js` - General Gemini AI endpoint
- `api/send-study-reminder.js` - Email reminder (manual)
- `api/health.js` - Health check endpoint

### Utilities (2 files - not serverless functions)
- `api/db.js` - MongoDB connection with caching
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
- `GET /api/auth/google?action=init` - Initiate Google OAuth
- `GET /api/auth/google?action=callback&code=...` - Google OAuth callback
- `GET /api/auth/github?action=init` - Initiate GitHub OAuth
- `GET /api/auth/github?action=callback&code=...` - GitHub OAuth callback

### User Progress (Consolidated endpoint)
- `GET /api/user/[userId]` - Get user progress
- `GET /api/user/[userId]?action=progress` - Get user progress
- `POST /api/user/[userId]` - Update user progress
- `POST /api/user/[userId]?action=progress` - Update user progress
- `POST /api/user/[userId]?action=quiz-result` - Save quiz result
- `POST /api/user/[userId]?action=lesson-progress` - Update lesson progress
- `POST /api/user/[userId]?action=streak` - Update streak
- `POST /api/user/[userId]?action=notification` - Add notification
- `PUT /api/user/[userId]?action=profile` - Update profile

### Features
- `POST /api/quiz-feedback` - Get AI quiz feedback
- `POST /api/gemini` - General Gemini AI endpoint
- `POST /api/send-study-reminder` - Send email reminder
- `GET /api/health` - Health check

## Session Management

The application uses JWT (JSON Web Tokens) for session management:

- **Token Storage**: HTTP-only cookies
- **Token Expiration**: 24 hours
- **Token Verification**: Verified on each authenticated request
- **Security**: Tokens are signed with `SESSION_SECRET`

This approach is stateless and works perfectly with Vercel's serverless architecture.

## OAuth Implementation

OAuth authentication uses direct OAuth flow without Passport.js middleware:

- **Google OAuth**: Direct redirect to Google OAuth endpoint, code exchange, and JWT token generation
- **GitHub OAuth**: Direct redirect to GitHub OAuth endpoint, code exchange, and JWT token generation
- **Serverless Compatible**: No middleware dependencies, works perfectly with Vercel functions
- **JWT Integration**: OAuth callbacks generate JWT tokens for stateless authentication

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

### Files Removed (Consolidation to meet 12-function limit)
- `api/auth/google/callback.js` - Callback logic moved to google.js via action parameter
- `api/auth/github/callback.js` - Callback logic moved to github.js via action parameter
- `api/user/lesson-progress/[userId].js` - Consolidated into api/user/[userId].js
- `api/user/notification/[userId].js` - Consolidated into api/user/[userId].js
- `api/user/profile/[userId].js` - Consolidated into api/user/[userId].js
- `api/user/progress/[userId].js` - Consolidated into api/user/[userId].js
- `api/user/quiz-result/[userId].js` - Consolidated into api/user/[userId].js
- `api/user/streak/[userId].js` - Consolidated into api/user/[userId].js

### Files Updated
- `vercel.json` - Removed callback routes (now handled via action parameters)
- `VERCEL_DEPLOYMENT_GUIDE.md` - Updated to reflect consolidated structure

### Final Serverless Function Count: 11 functions
1. `api/auth/register.js` - User registration
2. `api/auth/login.js` - User login
3. `api/auth/logout.js` - User logout
4. `api/auth/user.js` - Get current user
5. `api/auth/google.js` - Google OAuth (init + callback)
6. `api/auth/github.js` - GitHub OAuth (init + callback)
7. `api/user/[userId].js` - Consolidated user operations
8. `api/quiz-feedback.js` - AI quiz feedback
9. `api/gemini.js` - General Gemini AI endpoint
10. `api/send-study-reminder.js` - Email reminder
11. `api/health.js` - Health check

### Files Preserved (No Changes)
- `Server/server.js` - Kept for local development
- `Server/models/User.js` - User model unchanged
- `Server/config/database.js` - Database config unchanged
- All frontend code in `src/` - No changes
- Utility files: `api/db.js`, `api/lib/jwt.js` - Not serverless functions

All features work exactly as before, just consolidated to meet Vercel's 12-function limit.
