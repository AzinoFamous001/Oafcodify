import passport from 'passport';
import { GitHubStrategy } from 'passport-github2';
import connectToDatabase from '../../db.js';
import User from '../../../src/Backend/User Schema/index.js';

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

// Configure GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        await connectToDatabase();
        
        let user = await User.findOne({ githubId: profile.id });
        
        if (user) {
          return done(null, { user, isNewUser: false });
        }
        
        user = await User.findOne({ email: profile.emails?.[0]?.value });
        
        if (user) {
          user.githubId = profile.id;
          user.avatar = generateCartoonAvatar(profile.displayName || profile.username);
          await user.save();
          return done(null, { user, isNewUser: false });
        }
        
        user = await User.create({
          id: Date.now(),
          fullName: profile.displayName || profile.username,
          email: profile.emails?.[0]?.value || `${profile.username}@github.local`,
          githubId: profile.id,
          avatar: generateCartoonAvatar(profile.displayName || profile.username),
          provider: 'github'
        });
        
        done(null, { user, isNewUser: true });
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((data, done) => {
  done(null, data.user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    await connectToDatabase();
    const user = await User.findOne({ id });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default async function handler(req, res) {
  await passport.authenticate('github', { 
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed` 
  }, (err, data) => {
    if (err) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
    
    if (data.isNewUser) {
      // New user - redirect to signup page with newUser flag
      res.redirect(`${process.env.CLIENT_URL}/signup?auth=success&newUser=true`);
    } else {
      // Existing user - redirect to login page with success flag
      res.redirect(`${process.env.CLIENT_URL}/login?auth=success`);
    }
  })(req, res);
}
