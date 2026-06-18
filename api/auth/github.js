import connectToDatabase from '../db.js';
import User from '../../src/Backend/User Schema/index.js';
import { generateToken, setTokenCookie } from '../lib/jwt.js';

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
    const githubAuthUrl = 'https://github.com/login/oauth/authorize';
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      redirect_uri: process.env.GITHUB_CALLBACK_URL,
      scope: 'user:email',
    });
    res.redirect(`${githubAuthUrl}?${params.toString()}`);
    return;
  }

  // OAuth callback
  if (action === 'callback') {
    if (!code) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }

    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          code,
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          redirect_uri: process.env.GITHUB_CALLBACK_URL,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        throw new Error(tokenData.error);
      }

      // Get user info with access token
      const userResponse = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      const profile = await userResponse.json();

      // Get user email (GitHub requires separate API call for email)
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const emails = await emailResponse.json();
      const primaryEmail = emails.find(e => e.primary)?.email || `${profile.login}@github.local`;

      await connectToDatabase();

      let user = await User.findOne({ githubId: profile.id });
      let isNewUser = false;

      if (user) {
        console.log('GitHub OAuth (Vercel) - Existing user found with githubId:', user.id);
      } else {
        user = await User.findOne({ email: primaryEmail });

        if (user) {
          console.log('GitHub OAuth (Vercel) - Linking githubId to existing user:', user.id);
          user.githubId = profile.id;
          user.avatar = generateCartoonAvatar(profile.name || profile.login);
          await user.save();
        } else {
          console.log('GitHub OAuth (Vercel) - Creating new user for username:', profile.login);
          user = await User.create({
            id: Date.now(),
            fullName: profile.name || profile.login,
            email: primaryEmail,
            githubId: profile.id,
            avatar: generateCartoonAvatar(profile.name || profile.login),
            provider: 'github'
          });
          isNewUser = true;
          console.log('GitHub OAuth (Vercel) - New user created with id:', user.id);
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
      console.error('GitHub OAuth Error:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
  }
}
