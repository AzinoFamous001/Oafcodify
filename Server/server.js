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
const nodemailer = require("nodemailer");
const cron = require("node-cron");

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
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    sameSite: 'lax'
  },
  name: 'oafcodify.sid' // Custom session name for better isolation
}));

// PASSPORT INITIALIZATION
app.use(passport.initialize());
app.use(passport.session());

// SESSION VALIDATION MIDDLEWARE
const validateSession = (req, res, next) => {
  // If user is authenticated via passport, validate session
  if (req.isAuthenticated() && req.session.userId) {
    // Ensure session userId matches passport user
    if (req.user && req.user.id !== req.session.userId) {
      // Session mismatch - destroy session
      req.session.destroy((err) => {
        if (err) console.error("Session destruction error:", err);
      });
      return res.status(401).json({ message: "Session mismatch. Please login again." });
    }
  }
  next();
};

// GEMINI SETUP
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// EMAIL SETUP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Function to send study reminder email
async function sendStudyReminder(email, userName) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '📚 Time to Study on Oafcodify!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📚 Study Reminder</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Hello ${userName},</p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">It's time to continue your learning journey on Oafcodify! Consistent practice is the key to mastering programming.</p>
            <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #1976d2; margin: 0; font-weight: bold;">💡 Quick Tip:</p>
              <p style="color: #333; margin: 5px 0 0 0;">Even 15 minutes of daily practice can lead to significant improvement over time.</p>
            </div>
            <a href="http://localhost:5173/dashboard" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Continue Learning</a>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">Keep coding and never stop learning!</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">This is an automated reminder from Oafcodify.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Study reminder sent to ${email}`);
  } catch (error) {
    console.error('Error sending study reminder:', error);
  }
}

// Schedule daily study reminders at 9 AM
cron.schedule('0 9 * * *', async () => {
  try {
    const users = await getUsers();
    for (const user of users) {
      if (user.email) {
        await sendStudyReminder(user.email, user.fullName);
      }
    }
  } catch (error) {
    console.error('Error in daily reminder cron job:', error);
  }
});

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
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
      },
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

    // REGENERATE SESSION TO PREVENT SESSION FIXATION
    req.session.regenerate((err) => {
      if (err) {
        console.error("Session regeneration error:", err);
        return res.status(500).json({
          message: "Server error",
        });
      }

      // STORE USER ID IN SESSION WITH UNIQUE IDENTIFIER
      req.session.userId = user.id;
      req.session.sessionId = `${user.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({
            message: "Server error",
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
      });
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
    // REGENERATE SESSION TO PREVENT SESSION FIXATION
    req.session.regenerate((err) => {
      if (err) {
        console.error("Session regeneration error:", err);
        return res.redirect("/login");
      }

      // STORE USER ID IN SESSION WITH UNIQUE IDENTIFIER
      req.session.userId = req.user.id;
      req.session.sessionId = `${req.user.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.redirect("/login");
        }

        // Successful authentication
        res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard?auth=success`);
      });
    });
  }
);

// GitHub OAuth
app.get("/api/auth/github", passport.authenticate("github", { scope: ["user:email"] }));

app.get("/api/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    // REGENERATE SESSION TO PREVENT SESSION FIXATION
    req.session.regenerate((err) => {
      if (err) {
        console.error("Session regeneration error:", err);
        return res.redirect("/login");
      }

      // STORE USER ID IN SESSION WITH UNIQUE IDENTIFIER
      req.session.userId = req.user.id;
      req.session.sessionId = `${req.user.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.redirect("/login");
        }

        // Successful authentication
        res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard?auth=success`);
      });
    });
  }
);

// Get current user
app.get("/api/auth/user", validateSession, (req, res) => {
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
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destruction error:", err);
      return next(err);
    }
    req.logout((err) => {
      if (err) return next(err);
      res.clearCookie('oafcodify.sid');
      res.json({ message: "Logged out successfully" });
    });
  });
});

// =========================
// BASIC TEST ROUTE
// =========================
app.get("/", (req, res) => {
  res.send("CodeBay Backend Server Running...");
});

// =========================
// EMAIL REMINDER ROUTE
// =========================
app.post("/api/send-study-reminder", async (req, res) => {
  try {
    const { email, userName } = req.body;
    
    if (!email || !userName) {
      return res.status(400).json({ message: "Email and userName are required" });
    }

    await sendStudyReminder(email, userName);
    
    res.status(200).json({ message: "Study reminder sent successfully" });
  } catch (error) {
    console.error("Error sending study reminder:", error);
    res.status(500).json({ message: "Failed to send study reminder" });
  }
});

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
