import connectToDatabase from '../db.js';
import bcrypt from 'bcryptjs';
import User from '../../src/Backend/User Schema/index.js';
import { generateToken, setTokenCookie } from '../lib/jwt.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // VALIDATION
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    await connectToDatabase();

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

    // Generate JWT token
    const token = generateToken({ userId: user.id, email: user.email });
    setTokenCookie(res, token);

    // SUCCESS
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
}
