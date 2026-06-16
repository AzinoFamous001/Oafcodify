import connectToDatabase from '../../db.js';
import User from '../../../src/Backend/User Schema/index.js';
import { verifyToken } from '../../lib/jwt.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    const { quizResult } = req.body;

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
}
