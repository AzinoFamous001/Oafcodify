import connectToDatabase from '../db.js';
import bcrypt from 'bcryptjs';
import User from '../../src/Backend/User Schema/index.js';
import { generateToken, setTokenCookie } from '../lib/jwt.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fullName, email, password } = req.body;

    // VALIDATION
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    await connectToDatabase();

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

    // Generate JWT token
    const token = generateToken({ userId: newUser.id, email: newUser.email });
    setTokenCookie(res, token);

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
}
