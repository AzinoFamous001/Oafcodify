const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const session = require("express-session");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const connectDB = require("./config/database");
const User = require("./models/User");

const app = express();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// MIDDLEWARE
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Serve static files from dist directory (for Railway/production)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../dist")));
}

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
  // Only check if user is authenticated via passport
  // Removed strict session userId validation to prevent automatic logouts
  if (req.isAuthenticated()) {
    // User is authenticated, allow request
    return next();
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
    const users = await User.find({});
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
passport.serializeUser((data, done) => {
  // Handle both plain user object and { user, isNewUser } structure
  const user = data?.user || data;
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findOne({ id });
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
      // Find user in MongoDB by email or googleId
      let user = await User.findOne({
        $or: [
          { email: profile.emails[0].value },
          { googleId: profile.id }
        ]
      });

      let isNewUser = false;

      if (!user) {
        // Create new user in MongoDB
        console.log('Google Strategy - Creating new user for email:', profile.emails[0].value);
        user = new User({
          id: Date.now(),
          fullName: profile.displayName,
          email: profile.emails[0].value,
          provider: "google",
          googleId: profile.id,
          avatar: profile.photos?.[0]?.value || ""
        });
        await user.save();
        isNewUser = true;
        console.log('Google Strategy - New user created with id:', user.id, 'isNewUser:', isNewUser);
      } else if (!user.googleId) {
        // Link googleId to existing user
        console.log('Google Strategy - Linking googleId to existing user:', user.id);
        user.googleId = profile.id;
        if (!user.avatar && profile.photos?.[0]?.value) {
          user.avatar = profile.photos[0].value;
        }
        await user.save();
        console.log('Google Strategy - Existing user linked, isNewUser:', isNewUser);
      } else {
        console.log('Google Strategy - Existing user found with googleId:', user.id, 'isNewUser:', isNewUser);
      }

      return done(null, { user, isNewUser });
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
      // Find user in MongoDB
      const emailVal = profile.emails?.[0]?.value;
      let user = await User.findOne({ 
        $or: [
          ...(emailVal ? [{ email: emailVal }] : []),
          { githubId: profile.id }
        ]
      });

      let isNewUser = false;

      if (!user) {
        // Create new user in MongoDB
        console.log('GitHub Strategy - Creating new user for username:', profile.username);
        user = new User({
          id: Date.now(),
          fullName: profile.displayName || profile.username,
          email: emailVal || `${profile.username}@github.local`,
          provider: "github",
          githubId: profile.id,
          avatar: profile.photos?.[0]?.value || ""
        });
        await user.save();
        isNewUser = true;
        console.log('GitHub Strategy - New user created with id:', user.id, 'isNewUser:', isNewUser);
      } else if (!user.githubId) {
        // Link githubId to existing user
        console.log('GitHub Strategy - Linking githubId to existing user:', user.id);
        user.githubId = profile.id;
        if (!user.avatar && profile.photos?.[0]?.value) {
          user.avatar = profile.photos[0].value;
        }
        await user.save();
        console.log('GitHub Strategy - Existing user linked, isNewUser:', isNewUser);
      } else {
        console.log('GitHub Strategy - Existing user found with githubId:', user.id, 'isNewUser:', isNewUser);
      }

      return done(null, { user, isNewUser });
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
    // Use MongoDB for all user operations
    const users = await User.find({});
    return users;
  } catch (error) {
    console.error("Error reading users from MongoDB:", error);
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

    // CHECK IF USER EXISTS IN MONGODB
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // CREATE USER IN MONGODB
    const newUser = new User({
      id: Date.now(),
      fullName,
      email,
      password: hashedPassword,
      provider: 'local'
    });

    await newUser.save();

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

    // FIND USER IN MONGODB
    const user = await User.findOne({ email });

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

app.get("/api/auth/google/callback",
  (req, res, next) => {
    console.log('Google OAuth Callback - Starting...');
    passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=auth_failed` }, (err, data) => {
      if (err) {
        console.error('Google OAuth Callback - Error:', err);
        return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=auth_failed`);
      }
      
      console.log('Google OAuth Callback - Data received:', data);
      const user = data?.user || data;
      const isNewUser = data?.isNewUser || false;
      
      console.log('Google OAuth Callback - User:', user);
      console.log('Google OAuth Callback - isNewUser:', isNewUser);
      
      // Store isNewUser in session before regeneration
      req.session.oauthIsNewUser = isNewUser;
      
      // REGENERATE SESSION TO PREVENT SESSION FIXATION
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=session_regeneration_failed`);
        }

        // STORE USER ID IN SESSION WITH UNIQUE IDENTIFIER
        req.session.userId = user.id;
        req.session.sessionId = `${user.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        req.session.oauthIsNewUser = isNewUser; // Preserve after regeneration

        console.log('Google OAuth Callback - Session regenerated, userId:', user.id);

        // AUTHENTICATE USER IN THE NEW SESSION
        req.logIn(user, (loginErr) => {
          if (loginErr) {
            console.error("Passport login error:", loginErr);
            return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=login_failed`);
          }

          req.session.save((err) => {
            if (err) {
              console.error("Session save error:", err);
              return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=session_save_failed`);
            }

            console.log('Google OAuth Callback - Redirecting based on isNewUser:', isNewUser);
            // Successful authentication - redirect based on whether user is actually new
            if (isNewUser) {
              // New user - redirect to signup page which will navigate to dashboard
              console.log('Google OAuth Callback - Redirecting to signup with newUser=true');
              res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/signup?auth=success&newUser=true`);
            } else {
              // Existing user - redirect to login page to show success modal
              console.log('Google OAuth Callback - Redirecting to login with auth=success');
              res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?auth=success`);
            }
          });
        });
      });
    })(req, res, next);
  }
);

// GitHub OAuth
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

app.get("/api/auth/github/callback",
  (req, res, next) => {
    console.log('GitHub OAuth Callback - Starting...');
    passport.authenticate("github", { failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=auth_failed` }, (err, data) => {
      if (err) {
        console.error('GitHub OAuth Callback - Error:', err);
        return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=auth_failed`);
      }
      
      console.log('GitHub OAuth Callback - Data received:', data);
      const user = data?.user || data;
      const isNewUser = data?.isNewUser || false;
      
      console.log('GitHub OAuth Callback - User:', user);
      console.log('GitHub OAuth Callback - isNewUser:', isNewUser);
      
      // Store isNewUser in session before regeneration
      req.session.oauthIsNewUser = isNewUser;
      
      // REGENERATE SESSION TO PREVENT SESSION FIXATION
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=session_regeneration_failed`);
        }

        // STORE USER ID IN SESSION WITH UNIQUE IDENTIFIER
        req.session.userId = user.id;
        req.session.sessionId = `${user.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        req.session.oauthIsNewUser = isNewUser; // Preserve after regeneration

        console.log('GitHub OAuth Callback - Session regenerated, userId:', user.id);

        // AUTHENTICATE USER IN THE NEW SESSION
        req.logIn(user, (loginErr) => {
          if (loginErr) {
            console.error("Passport login error:", loginErr);
            return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=login_failed`);
          }

          req.session.save((err) => {
            if (err) {
              console.error("Session save error:", err);
              return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=session_save_failed`);
            }

            console.log('GitHub OAuth Callback - Redirecting based on isNewUser:', isNewUser);
            // Successful authentication - redirect based on whether user is actually new
            if (isNewUser) {
              // New user - redirect to signup page which will navigate to dashboard
              console.log('GitHub OAuth Callback - Redirecting to signup with newUser=true');
              res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/signup?auth=success&newUser=true`);
            } else {
              // Existing user - redirect to login page to show success modal
              console.log('GitHub OAuth Callback - Redirecting to login with auth=success');
              res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?auth=success`);
            }
          });
        });
      });
    })(req, res, next);
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
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return next(err);
      }
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
// USER PROGRESS ROUTES
// =========================

// Get user progress data
app.get("/api/user/progress/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ id: parseInt(userId) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return user progress data (or empty object if not exists)
    // Convert Map to plain object for JSON serialization
    const lessonProgressObj = user.lessonProgress instanceof Map 
      ? Object.fromEntries(user.lessonProgress) 
      : (user.lessonProgress || {});
    
    res.json({
      quizResults: user.quizResults || [],
      lessonProgress: lessonProgressObj,
      streak: user.streak || { current: 0, lastLogin: null },
      notifications: user.notifications || [],
      completedCourses: user.completedCourses || 0
    });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user progress data
app.post("/api/user/progress/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { quizResults, lessonProgress, streak, notifications, completedCourses } = req.body;

    const user = await User.findOne({ id: parseInt(userId) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user progress data
    if (quizResults !== undefined) user.quizResults = quizResults;
    if (lessonProgress !== undefined) {
      // Merge lessonProgress using Map methods to preserve individual lesson completions
      if (!user.lessonProgress) user.lessonProgress = new Map();
      Object.keys(lessonProgress).forEach(key => {
        user.lessonProgress.set(key, lessonProgress[key]);
      });
    }
    if (streak !== undefined) user.streak = streak;
    if (notifications !== undefined) user.notifications = notifications;
    if (completedCourses !== undefined) user.completedCourses = completedCourses;

    await user.save();

    res.json({ message: "Progress updated successfully" });
  } catch (error) {
    console.error("Error updating user progress:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add quiz result
app.post("/api/user/quiz-result/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { quizResult } = req.body;

    const user = await User.findOne({ id: parseInt(userId) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize quizResults array if not exists
    if (!user.quizResults) {
      user.quizResults = [];
    }

    // Check for duplicate quiz result using attemptId if available
    if (quizResult.attemptId) {
      const isDuplicate = user.quizResults.some(r => r.attemptId === quizResult.attemptId);
      if (isDuplicate) {
        return res.json({ message: "Quiz result already exists (duplicate prevented by attemptId)" });
      }
    }

    // Fallback: Check for duplicate quiz result (same user, course, lesson, score, and timestamp within 2 seconds)
    const isDuplicate = user.quizResults.some(
      r => r.userId === quizResult.userId &&
           r.courseKey === quizResult.courseKey &&
           r.lessonId === quizResult.lessonId &&
           r.score === quizResult.score &&
           r.totalQuestions === quizResult.totalQuestions &&
           Math.abs(new Date(r.date) - new Date(quizResult.date)) < 2000
    );

    if (isDuplicate) {
      return res.json({ message: "Quiz result already exists (duplicate prevented)" });
    }

    // Add new quiz result
    user.quizResults.push(quizResult);
    await user.save();

    res.json({ message: "Quiz result saved successfully" });
  } catch (error) {
    console.error("Error saving quiz result:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update lesson progress
app.post("/api/user/lesson-progress/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { courseKey, lessonId, completed, unlocked } = req.body;

    const user = await User.findOne({ id: parseInt(userId) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize lessonProgress Map if not exists
    if (!user.lessonProgress) {
      user.lessonProgress = new Map();
    }

    const key = `${courseKey}_lesson_${lessonId}`;
    const existingData = user.lessonProgress.get(key) || {};

    if (completed !== undefined) existingData.completed = completed;
    if (unlocked !== undefined) existingData.unlocked = unlocked;

    user.lessonProgress.set(key, existingData);

    await user.save();

    res.json({ message: "Lesson progress updated successfully" });
  } catch (error) {
    console.error("Error updating lesson progress:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update streak
app.post("/api/user/streak/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { streak, lastLogin } = req.body;

    const user = await User.findOne({ id: parseInt(userId) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize streak object if not exists
    if (!user.streak) {
      user.streak = {};
    }

    if (streak !== undefined) user.streak.current = streak;
    if (lastLogin !== undefined) user.streak.lastLogin = lastLogin;

    await user.save();

    res.json({ message: "Streak updated successfully" });
  } catch (error) {
    console.error("Error updating streak:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add notification
app.post("/api/user/notification/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { notification } = req.body;

    console.log('Notification Debug - userId:', userId);
    console.log('Notification Debug - notification:', notification);

    const user = await User.findOne({ id: parseInt(userId) });

    if (!user) {
      console.log('Notification Debug - User not found for userId:', userId);
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize notifications array if not exists
    if (!user.notifications) {
      user.notifications = [];
    }

    // Add new notification
    user.notifications.unshift(notification);
    await user.save();

    console.log('Notification Debug - Successfully saved notification for user:', userId);
    res.json({ message: "Notification added successfully" });
  } catch (error) {
    console.error("Error adding notification:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
app.put("/api/user/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { fullName, email, avatar } = req.body;

    const user = await User.findOne({ id: parseInt(userId) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (email !== undefined) user.email = email;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({ message: "Profile updated successfully", user: { id: user.id, fullName: user.fullName, email: user.email, avatar: user.avatar } });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
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
// SPA FALLBACK ROUTE (for Railway/production)
// =========================
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  });
}

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
