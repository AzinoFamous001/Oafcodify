import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, options, userAnswer, correctAnswer } = req.body;

    // VALIDATION
    if (!question || !userAnswer || !correctAnswer) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    // GEMINI MODEL
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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
}
