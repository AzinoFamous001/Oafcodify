const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const MongoStore = require("connect-mongo").default;
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });

const app = express();

// Trust proxy for secure cookies in production on Render
app.set("trust proxy", 1);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/oafcodify", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// User Model
const User = require("../User Schema/index.js");

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "oafcodify-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || "mongodb://localhost:27017/oafcodify",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Passport Initialization
app.use(passport.initialize());
app.use(passport.session());

// Passport Session Serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findOne({ id });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Generate cartoon avatar (deterministic based on username)
const generateCartoonAvatar = (userName) => {
  const avatarStyles = [
    'adventurer', 'adventurer-neutral', 'avataaars', 'bottts',
    'fun-emoji', 'lorelei', 'micah', 'notionists', 'open-peeps', 'personas'
  ];
  // Use a simple hash of the username to always select the same style for the same user
  let hash = 0;
  for (let i = 0; i < userName.length; i++) {
    hash = userName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const styleIndex = Math.abs(hash) % avatarStyles.length;
  const randomStyle = avatarStyles[styleIndex];
  const seed = userName || Math.random().toString(36).substring(7);
  return `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${seed}`;
};

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });
          
          if (user) {
            return done(null, user);
          }
          
          user = await User.findOne({ email: profile.emails[0].value });
          
          if (user) {
            user.googleId = profile.id;
            user.avatar = generateCartoonAvatar(profile.displayName);
            await user.save();
            return done(null, user);
          }
          
          user = await User.create({
            id: Date.now(),
            fullName: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            avatar: generateCartoonAvatar(profile.displayName),
            provider: 'google'
          });
          
          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
} else {
  console.warn("⚠️ Google OAuth credentials not found. Google authentication will not be available.");
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ githubId: profile.id });
          
          if (user) {
            return done(null, user);
          }
          
          user = await User.findOne({ email: profile.emails?.[0]?.value });
          
          if (user) {
            user.githubId = profile.id;
            user.avatar = generateCartoonAvatar(profile.displayName || profile.username);
            await user.save();
            return done(null, user);
          }
          
          user = await User.create({
            id: Date.now(),
            fullName: profile.displayName || profile.username,
            email: profile.emails?.[0]?.value || `${profile.username}@github.local`,
            githubId: profile.id,
            avatar: generateCartoonAvatar(profile.displayName || profile.username),
            provider: 'github'
          });
          
          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
} else {
  console.warn("⚠️ GitHub OAuth credentials not found. GitHub authentication will not be available.");
}

// Gemini API Integration
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY");

// Gemini API Route
app.post("/api/gemini", async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      error: "Failed to generate response",
      response: "AI service is currently unavailable. Please try again later." 
    });
  }
});

// OAuth Routes
app.get("/api/auth/google", (req, res, next) => {
  const from = req.query.from || "login";
  req.session.oauthFrom = from;
  req.session.save((err) => {
    if (err) {
      console.error("Session save error on Google auth init:", err);
    }
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
  });
});

app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed` }),
  (req, res) => {
    const from = req.session.oauthFrom || "login";
    // REGENERATE SESSION TO PREVENT SESSION FIXATION
    req.session.regenerate((err) => {
      if (err) {
        console.error("Session regeneration error:", err);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=session_regeneration_failed`);
      }

      // STORE USER ID IN SESSION WITH UNIQUE IDENTIFIER
      req.session.userId = req.user.id;
      req.session.sessionId = `${req.user.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // AUTHENTICATE USER IN THE NEW SESSION
      req.logIn(req.user, (loginErr) => {
        if (loginErr) {
          console.error("Passport login error:", loginErr);
          return res.redirect(`${process.env.CLIENT_URL}/login?error=login_failed`);
        }

        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.redirect(`${process.env.CLIENT_URL}/login?error=session_save_failed`);
          }

          // Successful authentication
          if (from === "signup") {
            res.redirect(`${process.env.CLIENT_URL}/signup?auth=success&newUser=true`);
          } else {
            res.redirect(`${process.env.CLIENT_URL}/login?auth=success`);
          }
        });
      });
    });
  }
);

app.get("/api/auth/github", (req, res, next) => {
  const from = req.query.from || "login";
  req.session.oauthFrom = from;
  req.session.save((err) => {
    if (err) {
      console.error("Session save error on GitHub auth init:", err);
    }
    passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
  });
});

app.get(
  "/api/auth/github/callback",
  passport.authenticate("github", { failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed` }),
  (req, res) => {
    const from = req.session.oauthFrom || "login";
    // REGENERATE SESSION TO PREVENT SESSION FIXATION
    req.session.regenerate((err) => {
      if (err) {
        console.error("Session regeneration error:", err);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=session_regeneration_failed`);
      }

      // STORE USER ID IN SESSION WITH UNIQUE IDENTIFIER
      req.session.userId = req.user.id;
      req.session.sessionId = `${req.user.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // AUTHENTICATE USER IN THE NEW SESSION
      req.logIn(req.user, (loginErr) => {
        if (loginErr) {
          console.error("Passport login error:", loginErr);
          return res.redirect(`${process.env.CLIENT_URL}/login?error=login_failed`);
        }

        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.redirect(`${process.env.CLIENT_URL}/login?error=session_save_failed`);
          }

          // Successful authentication
          if (from === "signup") {
            res.redirect(`${process.env.CLIENT_URL}/signup?auth=success&newUser=true`);
          } else {
            res.redirect(`${process.env.CLIENT_URL}/login?auth=success`);
          }
        });
      });
    });
  }
);

// Get Current User
app.get("/api/auth/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      user: {
        id: req.user.id,
        fullName: req.user.fullName,
        email: req.user.email,
        avatar: req.user.avatar,
      },
    });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

// Logout
app.post("/api/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../../../dist");
  app.use(express.static(distPath));

  // Handle client-side routing
  app.get("*", (req, res) => {
    // Don't redirect API routes
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "API endpoint not found" });
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 CodeBay Server running on port ${PORT}`);
  console.log(`🤖 Gemini API endpoint available at http://localhost:${PORT}/api/gemini`);
  console.log(`🔐 OAuth endpoints available at http://localhost:${PORT}/api/auth/*`);
  if (process.env.NODE_ENV === "production") {
    console.log(`📁 Serving static files from dist folder`);
  }
});
