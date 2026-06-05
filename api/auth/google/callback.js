import passport from 'passport';
import { GoogleStrategy } from 'passport-google-oauth20';
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

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        await connectToDatabase();
        
        let user = await User.findOne({ googleId: profile.id });
        
        let isNewUser = false;
        
        if (user) {
          console.log('Google Strategy (Vercel) - Existing user found with googleId:', user.id, 'isNewUser:', isNewUser);
          return done(null, { user, isNewUser });
        }
        
        user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
          console.log('Google Strategy (Vercel) - Linking googleId to existing user:', user.id);
          user.googleId = profile.id;
          user.avatar = generateCartoonAvatar(profile.displayName);
          await user.save();
          console.log('Google Strategy (Vercel) - Existing user linked, isNewUser:', isNewUser);
          return done(null, { user, isNewUser });
        }
        
        console.log('Google Strategy (Vercel) - Creating new user for email:', profile.emails[0].value);
        user = await User.create({
          id: Date.now(),
          fullName: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          avatar: generateCartoonAvatar(profile.displayName),
          provider: 'google'
        });
        isNewUser = true;
        console.log('Google Strategy (Vercel) - New user created with id:', user.id, 'isNewUser:', isNewUser);
        
        done(null, { user, isNewUser });
      } catch (err) {
        console.error('Google Strategy (Vercel) - Error:', err);
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
  await passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed` 
  }, (err, data) => {
    if (err) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
    
    if (data.isNewUser) {
      // New user - redirect to signup page with newUser flag (will navigate to dashboard)
      res.redirect(`${process.env.CLIENT_URL}/signup?auth=success&newUser=true`);
    } else {
      // Existing user - redirect to login page with success flag (will show success modal)
      res.redirect(`${process.env.CLIENT_URL}/login?auth=success`);
    }
  })(req, res);
}
