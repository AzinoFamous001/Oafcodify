# MongoDB Implementation Guide for Oafcodify

## Overview
This guide walks you through the MongoDB implementation for the Oafcodify project. The application has been migrated from file-based storage (users.json) to MongoDB for better scalability and data persistence.

## Prerequisites

### Option A: Local MongoDB Installation
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Install MongoDB following the installation wizard
3. Start MongoDB service:
   - Windows: Run as service or use `mongod` command
   - Default port: 27017
4. Verify installation by running `mongosh` in terminal

### Option B: MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up/login and create a free cluster
3. Create a database user with username/password
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string from the "Connect" button
6. Connection string format: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>`

## Installation Steps

### 1. Install Dependencies (Already Done)
```bash
cd Server
npm install mongoose
```

### 2. Configure MongoDB Connection String

Edit `Server/.env` and update the MONGODB_URI:

**For Local MongoDB:**
```
MONGODB_URI=mongodb://localhost:27017/oafcodify
```

**For MongoDB Atlas:**
```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/oafcodify
```

### 3. Start MongoDB

**Local MongoDB:**
- Windows: Start MongoDB service from Services or run `mongod`
- Mac/Linux: Run `mongod` in terminal

**MongoDB Atlas:**
- No action needed, cloud database is always running

### 4. Migrate Existing Users (Optional)

If you have existing users in `users.json`, run the migration script:

```bash
cd Server
node migrate.js
```

This will:
- Connect to MongoDB
- Read existing users from users.json
- Migrate them to MongoDB
- Create a backup of users.json as users.json.backup

### 5. Start the Server

```bash
cd Server
npm start
```

The server will now:
- Connect to MongoDB on startup
- Use MongoDB for all user data operations
- Maintain backward compatibility with existing frontend code

## What Changed

### Backend Changes
- **Database Connection**: Added MongoDB connection via Mongoose
- **User Schema**: Created Mongoose schema for User model
- **Authentication**: Updated register/login/OAuth to use MongoDB
- **Progress Tracking**: Updated all progress endpoints to use MongoDB
- **Cron Jobs**: Updated email reminder cron to query MongoDB

### Files Created
- `Server/config/database.js` - MongoDB connection configuration
- `Server/models/User.js` - Mongoose User schema
- `Server/migrate.js` - Migration script for existing users

### Files Modified
- `Server/server.js` - Updated to use MongoDB
- `Server/.env` - Added MONGODB_URI configuration
- `Server/package.json` - Added mongoose dependency

## Testing

### 1. Test User Registration
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","password":"password123"}'
```

### 2. Test User Login
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. Test Progress Endpoints
```bash
# Get user progress
curl http://localhost:5000/api/user/progress/<userId>

# Update progress
curl -X POST http://localhost:5000/api/user/progress/<userId> \
  -H "Content-Type: application/json" \
  -d '{"streak":{"current":5,"lastLogin":"2024-01-01"}}'
```

## Troubleshooting

### MongoDB Connection Failed
- Check if MongoDB is running (local) or connection string is correct (Atlas)
- Verify MONGODB_URI in .env file
- Check firewall/network settings for Atlas

### Migration Script Fails
- Ensure MongoDB is running before running migrate.js
- Check that users.json exists and is valid JSON
- Verify MongoDB connection string is correct

### Server Won't Start
- Check MongoDB connection logs
- Verify all dependencies are installed
- Check for port conflicts (default: 5000)

## Benefits of MongoDB

1. **Scalability**: Handle millions of users efficiently
2. **Performance**: Faster queries with indexing
3. **Flexibility**: Easy to add new fields without schema changes
4. **Reliability**: Built-in replication and failover
5. **Cloud Support**: Easy deployment with MongoDB Atlas
6. **Cross-Browser Sync**: Data persists across devices/browsers (already implemented)

## Next Steps

1. Set up MongoDB (local or Atlas)
2. Update .env with your connection string
3. Run migration script if you have existing users
4. Start the server and test
5. Monitor MongoDB performance in production

## Support

For MongoDB documentation: https://docs.mongodb.com/
For Mongoose documentation: https://mongoosejs.com/docs/
