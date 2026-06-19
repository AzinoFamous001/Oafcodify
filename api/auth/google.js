import connectToDatabase from '../../lib/db.js';
import User from '../../src/Backend/User Schema/index.js';
import { generateToken, setTokenCookie } from '../../lib/jwt.js';

// Generate cartoon avatar (deterministic based on username)
const generateCartoonAvatar = (userName) => {
  const avatarStyles = [
    'adventurer', 'adventurer-neutral', 'avataaars', 'bottts',
    'fun-emoji', 'lorelei', 'micah', 'notionists', 'open-peeps', 'personas'
  ];
  let hash = 0;
  for (let i = 0; i < userName.length; i++) {
    hash = userName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const styleIndex = Math.abs(hash) % avatarStyles.length;
  const randomStyle = avatarStyles[styleIndex];
  const seed = userName || Math.random().toString(36).substring(7);
  return `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${seed}`;
};

export default async function handler(req, res) {
  const { code, action } = req.query;

  // OAuth initiation
  if (!action || action === 'init') {
    const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
      response_type: 'code',
      scope: 'profile email',
      access_type: 'offline',
    });
    res.redirect(`${googleAuthUrl}?${params.toString()}`);
    return;
  }

  // OAuth callback
  if (action === 'callback') {
    if (!code) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }

    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: process.env.GOOGLE_CALLBACK_URL,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        throw new Error(tokenData.error);
      }

      // Get user info with access token
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      const profile = await userResponse.json();

      await connectToDatabase();

      let user = await User.findOne({ googleId: profile.id });
      let isNewUser = false;

      if (user) {
        console.log('Google OAuth (Vercel) - Existing user found with googleId:', user.id);
      } else {
        user = await User.findOne({ email: profile.email });

        if (user) {
          console.log('Google OAuth (Vercel) - Linking googleId to existing user:', user.id);
          user.googleId = profile.id;
          user.avatar = generateCartoonAvatar(profile.name);
          await user.save();
        } else {
          console.log('Google OAuth (Vercel) - Creating new user for email:', profile.email);
          user = await User.create({
            id: Date.now(),
            fullName: profile.name,
            email: profile.email,
            googleId: profile.id,
            avatar: generateCartoonAvatar(profile.name),
            provider: 'google'
          });
          isNewUser = true;
          console.log('Google OAuth (Vercel) - New user created with id:', user.id);
        }
      }

      // Generate JWT token and set cookie
      const token = generateToken({ userId: user.id, email: user.email });
      setTokenCookie(res, token);

      if (isNewUser) {
        res.redirect(`${process.env.CLIENT_URL}/signup?auth=success&newUser=true`);
      } else {
        res.redirect(`${process.env.CLIENT_URL}/login?auth=success`);
      }
    } catch (error) {
      console.error('Google OAuth Error:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
  }
}
