# Vercel Deployment Guide for Oafcodify

This guide will help you deploy your Oafcodify application to Vercel.

## Prerequisites

- A Vercel account (free at [vercel.com](https://vercel.com))
- A MongoDB Atlas account (free tier available)
- Google OAuth credentials
- GitHub OAuth credentials
- Gemini API key

## Step 1: Prepare MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user with read/write permissions
4. Whitelist IP addresses (use `0.0.0.0/0` for all IPs for development)
5. Get your connection string from the "Connect" button
6. Format: `mongodb+srv://username:password@cluster.mongodb.net/codebay`

## Step 2: Get OAuth Credentials

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth client ID
5. Add authorized redirect URI: `https://your-app.vercel.app/api/auth/google/callback`
6. Copy Client ID and Client Secret

### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Set Authorization callback URL: `https://your-app.vercel.app/api/auth/github/callback`
4. Copy Client ID and generate Client Secret

## Step 3: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com)
2. Create an API key
3. Copy the API key

## Step 4: Deploy to Vercel

### Option A: Using Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Follow the prompts and set environment variables when asked

### Option B: Using Vercel Dashboard

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure environment variables in the project settings

## Step 5: Configure Environment Variables

Add these environment variables in Vercel project settings:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codebay
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
```

**Important:** Replace `your-app.vercel.app` with your actual Vercel domain after deployment.

## Step 6: Update OAuth Callback URLs

After deployment, update your OAuth provider callback URLs:

1. **Google OAuth**: Update the authorized redirect URI to your Vercel domain
2. **GitHub OAuth**: Update the Authorization callback URL to your Vercel domain

## Step 7: Test the Deployment

1. Visit your deployed app
2. Test OAuth login (Google and GitHub)
3. Test the Gemini AI feature
4. Test quiz functionality
5. Test streak counter

## Known Limitations

### Session Management
The current implementation uses a simplified session approach. For production use on Vercel, consider:
- Using Vercel KV for session storage
- Implementing JWT tokens for stateless authentication
- Using a dedicated session service like Redis

### Serverless Functions
- MongoDB connections are cached for performance
- Cold starts may occur on first API calls
- Consider using Vercel's Edge Functions for better performance

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
- Check that Node.js version is compatible
- Review build logs in Vercel dashboard

## Local Development

To run locally with the same configuration:

1. Copy `.env.example` to `.env`
2. Fill in your environment variables
3. Run:
```bash
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` and you'll need to run the backend separately if using the traditional Express server.

## Support

For issues specific to Vercel deployment, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://vercel.com/community)
