import connectToDatabase from '../../lib/db.js';
import User from '../../src/Backend/User Schema/index.js';
import { verifyToken } from '../../lib/jwt.js';

export default async function handler(req, res) {
  const { userId } = req.query;
  const { action } = req.query;

  // Verify JWT token for all operations
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

  // GET: Get user progress
  if (req.method === 'GET' && (!action || action === 'progress')) {
    try {
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
  }
  // POST: Update general progress
  else if (req.method === 'POST' && (!action || action === 'progress')) {
    try {
      const { quizResults, lessonProgress, streak, notifications, completedCourses } = req.body;

      if (quizResults !== undefined) user.quizResults = quizResults;
      if (lessonProgress !== undefined) {
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
  }
  // POST: Save quiz result
  else if (req.method === 'POST' && action === 'quiz-result') {
    try {
      const { quizResult } = req.body;

      if (!user.quizResults) {
        user.quizResults = [];
      }

      if (quizResult.attemptId) {
        const isDuplicate = user.quizResults.some(r => r.attemptId === quizResult.attemptId);
        if (isDuplicate) {
          return res.json({ message: "Quiz result already exists (duplicate prevented by attemptId)" });
        }
      }

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

      user.quizResults.push(quizResult);
      await user.save();
      res.json({ message: "Quiz result saved successfully" });
    } catch (error) {
      console.error("Error saving quiz result:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
  // POST: Update lesson progress
  else if (req.method === 'POST' && action === 'lesson-progress') {
    try {
      const { courseKey, lessonId, completed, unlocked } = req.body;

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
  }
  // POST: Update streak
  else if (req.method === 'POST' && action === 'streak') {
    try {
      const { streak, lastLogin } = req.body;

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
  // POST: Add notification
  else if (req.method === 'POST' && action === 'notification') {
    try {
      const { notification } = req.body;

      if (!user.notifications) {
        user.notifications = [];
      }

      user.notifications.unshift(notification);
      await user.save();
      res.json({ message: "Notification added successfully" });
    } catch (error) {
      console.error("Error adding notification:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
  // PUT: Update profile
  else if (req.method === 'PUT' && action === 'profile') {
    try {
      const { fullName, email, avatar } = req.body;

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
  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
