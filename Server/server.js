require("dotenv").config();

const express = require("express");
const fs = require("fs-extra");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const session = require("express-session");

const app = express();

const PORT = process.env.PORT || 5000;

const FILE_PATH = path.join(__dirname, "users.json");

// MIDDLEWARE
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// SESSION CONFIGURATION
app.use(session({
  secret: process.env.SESSION_SECRET || "oafcodify-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// PASSPORT INITIALIZATION
app.use(passport.initialize());
app.use(passport.session());

// GEMINI SETUP
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// =========================
// PASSPORT SERIALIZATION
// =========================
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const users = await getUsers();
    const user = users.find(u => u.id === id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// =========================
// GOOGLE OAUTH STRATEGY
// =========================
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const users = await getUsers();
      let user = users.find(u => u.email === profile.emails[0].value);

      if (!user) {
        // Create new user
        user = {
          id: Date.now(),
          fullName: profile.displayName,
          email: profile.emails[0].value,
          provider: "google",
          googleId: profile.id,
          avatar: profile.photos[0]?.value
        };
        users.push(user);
        await fs.outputJson(FILE_PATH, users);
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
}

// =========================
// GITHUB OAUTH STRATEGY
// =========================
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:5000/api/auth/github/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const users = await getUsers();
      let user = users.find(u => u.email === profile.emails?.[0]?.value || u.githubId === profile.id);

      if (!user) {
        // Create new user
        user = {
          id: Date.now(),
          fullName: profile.displayName || profile.username,
          email: profile.emails?.[0]?.value || `${profile.username}@github.local`,
          provider: "github",
          githubId: profile.id,
          avatar: profile.photos[0]?.value
        };
        users.push(user);
        await fs.outputJson(FILE_PATH, users);
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
}

// =========================
// USERS HELPER
// =========================
async function getUsers() {
  try {
    if (!fs.existsSync(FILE_PATH)) {
      await fs.outputJson(FILE_PATH, []);
    }

    const data = await fs.readFile(FILE_PATH, "utf8");

    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading users file:", error);
    return [];
  }
}

// =========================
// REGISTER ROUTE
// =========================
app.post("/api/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // VALIDATION
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const users = await getUsers();

    // CHECK IF USER EXISTS
    const existingUser = users.find((u) => u.email === email);

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // CREATE USER
    const newUser = {
      id: Date.now(),
      fullName,
      email,
      password: hashedPassword,
    };

    users.push(newUser);

    await fs.outputJson(FILE_PATH, users);

    res.status(201).json({
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Register Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// =========================
// LOGIN ROUTE
// =========================
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // VALIDATION
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    const users = await getUsers();

    const user = users.find((u) => u.email === email);

    // USER NOT FOUND
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // PASSWORD CHECK
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // SUCCESS
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// =========================
// GEMINI QUIZ FEEDBACK ROUTE
// =========================
app.post("/api/quiz-feedback", async (req, res) => {
  try {
    const { question, options, userAnswer, correctAnswer } = req.body;

    // VALIDATION
    if (!question || !userAnswer || !correctAnswer) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    // GEMINI MODEL
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    // AI PROMPT
    const prompt = `
You are an intelligent educational AI tutor.

A student answered a quiz question incorrectly.

QUESTION:
${question}

OPTIONS:
${options?.join("\n")}

STUDENT ANSWER:
${userAnswer}

CORRECT ANSWER:
${correctAnswer}

YOUR TASK:
1. Explain why the student's answer is incorrect.
2. Explain why the correct answer is correct.
3. Teach the concept in a simple beginner-friendly way.
4. Keep the explanation concise and educational.
`;

    // GENERATE AI RESPONSE
    const result = await model.generateContent(prompt);

    const response = await result.response;

    const text = response.text();

    // SEND RESPONSE
    res.status(200).json({
      status: "failed",
      explanation: text,
      correctAnswer,
    });
  } catch (error) {
    console.error("Gemini Quiz Feedback Error:", error);

    res.status(500).json({
      error: "Failed to generate AI feedback",
    });
  }
});

// =========================
// OAUTH ROUTES
// =========================

// Google OAuth
app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication
    res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard?auth=success`);
  }
);

// GitHub OAuth
app.get("/api/auth/github", passport.authenticate("github", { scope: ["user:email"] }));

app.get("/api/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication
    res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard?auth=success`);
  }
);

// Get current user
app.get("/api/auth/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      user: {
        id: req.user.id,
        fullName: req.user.fullName,
        email: req.user.email,
        avatar: req.user.avatar
      }
    });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

// Logout
app.post("/api/auth/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ message: "Logged out successfully" });
  });
});

// =========================
// BASIC TEST ROUTE
// =========================
app.get("/", (req, res) => {
  res.send("CodeBay Backend Server Running...");
});

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
