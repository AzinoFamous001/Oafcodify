import connectToDatabase from '../db.js';
import User from '../../src/Backend/User Schema/index.js';
import { verifyToken } from '../lib/jwt.js';

export default async function handler(req, res) {
  const { userId } = req.query;

  if (req.method === 'GET') {
    try {
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
  } else if (req.method === 'POST') {
    try {
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
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
