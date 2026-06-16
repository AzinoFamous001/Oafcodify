import connectToDatabase from '../../db.js';
import User from '../../../src/Backend/User Schema/index.js';
import { verifyToken } from '../../lib/jwt.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    const { streak, lastLogin } = req.body;

    // Verify JWT token
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userId !== parseInt(userId)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await connectToDatabase();
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
}
