const express = require("express");
const fs = require("fs-extra");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();
const PORT = 5000;
const FILE_PATH = path.join(__dirname, "users.json");

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware (VERY useful during development)
app.use((req, res, next) => {
  console.log("Incoming request:", req.body);
  next();
});

// Helper: safely read users
const getUsers = async () => {
  try {
    if (!fs.existsSync(FILE_PATH)) return [];

    const data = await fs.readFile(FILE_PATH, "utf8");

    if (!data) return [];

    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading users file:", error);
    return [];
  }
};

// Helper: save users
const saveUsers = async (users) => {
  try {
    await fs.writeFile(FILE_PATH, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error saving users file:", error);
  }
};

// ======================
// REGISTER ROUTE
// ======================
app.post("/api/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // ✅ VALIDATION (FIXED ISSUE)
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const users = await getUsers();

    // Check if user exists
    const userExists = users.find((u) => u.email === email);
    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: Date.now(),
      fullName,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await saveUsers(users);

    return res.status(201).json({
      message: "Registration successful!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
});

// ======================
// LOGIN ROUTE (OPTIONAL BUT IMPORTANT)
// ======================
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const users = await getUsers();

    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
