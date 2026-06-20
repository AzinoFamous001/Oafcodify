# Render Deployment Guide for Oafcodify

This guide will help you deploy your Oafcodify application to Render.

## Prerequisites

- A Render account (free at [render.com](https://render.com))
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
6. Format: `mongodb+srv://username:password@cluster.mongodb.net/oafcodify`

## Step 2: Get OAuth Credentials

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth client ID
5. Add authorized redirect URI: `https://your-app.onrender.com/api/auth/google/callback`
6. Copy Client ID and Client Secret

### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Set Authorization callback URL: `https://your-app.onrender.com/api/auth/github/callback`
4. Copy Client ID and generate Client Secret

## Step 3: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com)
2. Create an API key
3. Copy the API key

## Step 4: Deploy to Render

### Option A: Using Render Dashboard

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New +" > "Web Service"
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` configuration
6. Review and deploy

### Option B: Manual Configuration

If you prefer manual configuration:

1. Create a new Web Service in Render
2. Set the following:
   - **Name**: oafcodify-app
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node Server/server.js`
   - **Instance Type**: Free (or paid for better performance)

## Step 5: Configure Environment Variables

Add these environment variables in your Render service settings:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/oafcodify
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-app.onrender.com/api/auth/google/callback
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://your-app.onrender.com/api/auth/github/callback
GEMINI_API_KEY=your_gemini_api_key
SESSION_SECRET=your_random_secret_key
CLIENT_URL=https://your-app.onrender.com
NODE_ENV=production
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password
```

**Important:** Replace `your-app.onrender.com` with your actual Render domain after deployment.

## Step 6: Update OAuth Callback URLs

After deployment, update your OAuth provider callback URLs:

1. **Google OAuth**: Update the authorized redirect URI to your Render domain
2. **GitHub OAuth**: Update the Authorization callback URL to your Render domain

## Step 7: Test the Deployment

1. Visit your deployed app
2. Test OAuth login (Google and GitHub)
3. Test the Gemini AI feature
4. Test quiz functionality
5. Test streak counter

## Architecture Overview

This deployment uses a **monolithic architecture** where:
- The Express server serves both API routes and static frontend files
- The frontend is built with Vite and served from the `dist` folder
- All requests are handled by a single Render web service

## Known Limitations

### Session Management
The current implementation uses MongoDB for session storage. For production use on Render, consider:
- Using Render Redis for session storage (better performance)
- Implementing JWT tokens for stateless authentication
- Monitoring session storage usage

### Performance
- Free tier instances may have cold starts
- Consider upgrading to paid tier for better performance
- Monitor resource usage in Render dashboard

### Database Connection
- MongoDB connections are cached for performance
- Ensure your MongoDB Atlas cluster can handle the connection load
- Consider using connection pooling for high-traffic scenarios

## Troubleshooting

### Build Errors
- Ensure all dependencies are in package.json
- Check that Node.js version is compatible (Render uses latest Node.js by default)
- Review build logs in Render dashboard

### OAuth Callback Errors
- Ensure callback URLs match exactly (including http/https)
- Check that environment variables are set correctly
- Verify OAuth app is not in test mode

### MongoDB Connection Errors
- Check IP whitelist in MongoDB Atlas
- Verify connection string format
- Ensure database user has correct permissions

### Static File Serving Issues
- Ensure the build command runs successfully
- Check that the `dist` folder is created
- Verify the static file path in server.js

## Local Development

To run locally with the same configuration:

1. Copy `.env.render.example` to `.env`
2. Fill in your environment variables
3. Run:
```bash
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` and the backend on `http://localhost:5000`.

## Monitoring

Render provides built-in monitoring:
- Access logs in your service dashboard
- Monitor metrics (CPU, memory, response time)
- Set up alerts for performance issues
- Check health endpoint: `https://your-app.onrender.com/api/health`

## Scaling

If you need to scale your application:

1. **Upgrade Instance Type**: Move from Free to Standard/Pro tier
2. **Add Redis**: Use Render Redis for session storage
3. **Database Scaling**: Upgrade MongoDB Atlas cluster
4. **CDN**: Consider using Render's CDN for static assets

## Support

For issues specific to Render deployment, check:
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Render Status Page](https://status.render.com)
