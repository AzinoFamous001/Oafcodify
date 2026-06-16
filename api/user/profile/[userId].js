import connectToDatabase from '../../db.js';
import User from '../../../src/Backend/User Schema/index.js';
import { verifyToken } from '../../lib/jwt.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    const { fullName, email, avatar } = req.body;

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

    if (fullName !== undefined) user.fullName = fullName;
    if (email !== undefined) user.email = email;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({ message: "Profile updated successfully", user: { id: user.id, fullName: user.fullName, email: user.email, avatar: user.avatar } });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
}
