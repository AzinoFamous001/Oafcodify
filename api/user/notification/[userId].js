import connectToDatabase from '../../db.js';
import User from '../../../src/Backend/User Schema/index.js';
import { verifyToken } from '../../lib/jwt.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    const { notification } = req.body;

    console.log('Notification Debug - userId:', userId);
    console.log('Notification Debug - notification:', notification);

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
}
