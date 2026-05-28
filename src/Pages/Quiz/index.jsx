import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaRobot,
  FaRegLightbulb,
  FaCode,
  FaDatabase,
} from "react-icons/fa";

//
// Button Component
//
const Button = ({ children, onClick, disabled, className = "" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
px-6 py-3 rounded-xl font-bold transition-all
${
  disabled
    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
    : "bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:scale-105 active:scale-95 shadow-lg"
}
${className}
`}
  >
    {children}
  </button>
);

//
// Backend Gemini Call
//
async function callGemini(prompt) {
  try {
    const res = await fetch("http://localhost:5000/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      throw new Error(`Server responded with status: ${res.status}`);
    }

    const data = await res.json();
    return data.response || "No response available";
  } catch (err) {
    console.error("Gemini API Error:", err);
    
    // Provide contextual fallback responses based on the type of prompt
    if (prompt.includes("hint")) {
      return "💡 Hint: Read the question carefully and consider what you've learned in the lesson.";
    } else if (prompt.includes("explain")) {
      return "📚 This concept relates to fundamental web development principles. Review the lesson materials for detailed explanations.";
    } else if (prompt.includes("simplify")) {
      return "🎯 Think of this as a basic building block of web pages. Start with the simplest explanation.";
    } else if (prompt.includes("scored")) {
      return "🌟 Great effort! Keep practicing and reviewing the lesson materials to improve your understanding.";
    } else {
      return "🤖 AI assistance is currently unavailable. Please review your lesson materials or ask your instructor for help.";
    }
  }
}

//
// Fisher-Yates shuffle algorithm
//
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

//
// Load quiz questions from JSON files
//
const loadQuizQuestions = async (courseKey, lessonId) => {
  try {
    const response = await fetch(`/api/quizzes/${courseKey}/lesson${lessonId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load quiz for ${courseKey} lesson ${lessonId}`);
    }
    let questions = await response.json();

    // Shuffle questions randomly
    questions = shuffleArray(questions);

    // Shuffle options within each question and update correctAnswer index
    questions = questions.map(question => {
      const originalOptions = question.options;
      const originalCorrectIndex = question.correctAnswer;
      const correctOptionText = originalOptions[originalCorrectIndex];

      // Create array of option objects with original index
      const optionsWithIndex = originalOptions.map((opt, idx) => ({
        text: opt,
        isCorrect: idx === originalCorrectIndex
      }));

      // Shuffle options
      const shuffledOptionsWithIndex = shuffleArray(optionsWithIndex);

      // Find new index of correct answer
      const newCorrectIndex = shuffledOptionsWithIndex.findIndex(opt => opt.isCorrect);

      // Return question with shuffled options and updated correctAnswer
      return {
        ...question,
        options: shuffledOptionsWithIndex.map(opt => opt.text),
        correctAnswer: newCorrectIndex
      };
    });

    return questions;
  } catch (error) {
    console.error('Error loading quiz questions:', error);
    // Fallback to default questions if JSON loading fails
    return [
      {
        id: 1,
        question: "Quiz questions could not be loaded. Please try again later.",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        correctAnswer: 0,
        explanation: "This is a fallback question due to loading error.",
      }
    ];
  }
};

//
// Grade helper
//
function getGrade(percent) {
  if (percent >= 90) {
    return {
      label: "Excellent",
      emoji: "🏆",
      color: "text-green-400",
    };
  }

  if (percent >= 70) {
    return {
      label: "Great Job",
      emoji: "🌟",
      color: "text-sky-400",
    };
  }

  if (percent >= 50) {
    return {
      label: "Keep Going",
      emoji: "💪",
      color: "text-yellow-400",
    };
  }

  return {
    label: "Practice More",
    emoji: "📚",
    color: "text-red-400",
  };
}

const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-60">
    <div className="absolute top-[10%] left-[5%] animate-[spin_20s_linear_infinite]">
      <FaCode size={120} className="text-white/20" />
    </div>
    <div className="absolute bottom-[15%] left-[15%] animate-bounce duration-[5000ms]">
      <FaDatabase size={80} className="text-white/10" />
    </div>
  </div>
);

//
// Gemini Assistant Panel
//
function GeminiPanel({ question, onClose }) {
  const [tab, setTab] = useState("hint");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [cache, setCache] = useState({});

  const prompts = {
    hint: `Give one short hint without revealing answer:
${question}`,

    explain: `Explain this concept simply:
${question}`,

    simplify: `Rephrase simply:
${question}`,
  };

  async function loadTab(name) {
    setTab(name);

    if (cache[name]) {
      setContent(cache[name]);
      return;
    }

    setLoading(true);

    const reply = await callGemini(prompts[name]);

    setCache((prev) => ({
      ...prev,
      [name]: reply,
    }));

    setContent(reply);

    setLoading(false);
  }

  useEffect(() => {
    loadTab("hint");
  }, []);

  return (
    <div className="mt-6 rounded-2xl border border-sky-400/30 bg-sky-950/60 overflow-hidden">
      <div className="flex justify-between px-5 py-3 border-b border-sky-400/20">
        <div className="flex gap-2 items-center text-sky-300 font-bold">
          <FaRobot />
          Gemini Assistant
        </div>

        <button onClick={onClose}>✕</button>
      </div>

      <div className="flex gap-2 p-4">
        {["hint", "explain", "simplify"].map((item) => (
          <button
            key={item}
            onClick={() => loadTab(item)}
            className={`px-3 py-1 rounded-full text-xs
${tab === item ? "bg-sky-500 text-white" : "text-sky-300"}`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="px-5 pb-5 text-sm text-sky-100">
        {loading ? "Gemini thinking..." : content}
      </div>
    </div>
  );
}

//
// Result Screen
//
function ResultScreen({ score, questions, navigate, restartQuiz, courseKey, lessonId }) {
  const pct = Math.round((score / questions.length) * 100);

  const grade = getGrade(pct);

  const [feedback, setFeedback] = useState("Loading...");

  useEffect(() => {
    (async () => {
      const reply = await callGemini(
        `Student scored
${score}/${questions.length}
Give praise and one improvement tip`,
      );

      setFeedback(reply);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 flex items-center justify-center text-white">
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-md bg-white/5 p-10 rounded-3xl border border-white/10 text-center">
        <div className="text-6xl mb-5">{grade.emoji}</div>

        <h2 className={`text-3xl font-black mb-3 ${grade.color}`}>
          {grade.label}
        </h2>

        <p className="mb-6">
          Score:
          {score}/{questions.length}({pct}%)
        </p>

        <div className="bg-sky-950/60 rounded-xl p-5 text-left mb-8">
          <div className="font-bold text-sky-400 mb-2">AI Feedback</div>

          {feedback}
        </div>

        <div className="space-y-4">
          <Button onClick={restartQuiz} className="w-full">
            Retry Quiz
          </Button>

          <Button onClick={() => navigate("/")} className="w-full">
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
}

//
// Main Quiz Page
//
export default function QuizPage() {
  const { courseKey, lessonId } = useParams();

  const navigate = useNavigate();

  const [index, setIndex] = useState(0);

  const [selected, setSelected] = useState(null);

  const [answered, setAnswered] = useState(false);

  const [score, setScore] = useState(0);

  const [showAI, setShowAI] = useState(false);

  const [showResults, setShowResults] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const q = questions[index] || {};

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      const loadedQuestions = await loadQuizQuestions(courseKey, lessonId);
      setQuestions(loadedQuestions);
      setLoading(false);
    };

    if (courseKey && lessonId) {
      loadQuestions();
    }
  }, [courseKey, lessonId]);

  // Auto-scroll to top on page mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [courseKey, lessonId]);

  function checkAnswer() {
    if (selected === q.correctAnswer) {
      setScore((s) => s + 1);
    }

    setAnswered(true);
  }

  function nextQuestion() {
    if (index + 1 < questions.length) {
      setIndex(index + 1);

      setSelected(null);

      setAnswered(false);

      setShowAI(false);
    } else {
      setShowResults(true);
    }
  }

  function restartQuiz() {
    setIndex(0);

    setSelected(null);

    setAnswered(false);

    setScore(0);

    setShowAI(false);

    setShowResults(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 flex items-center justify-center text-white">
        <AnimatedBackground />
        <div className="relative z-10 text-center">
          <div className="text-2xl mb-4">Loading Quiz...</div>
          <div className="text-blue-200">Preparing questions for {courseKey} - Lesson {lessonId}</div>
        </div>
      </div>
    );
  }

  if (showResults) {
    // Redirect to QuizResult page with state
    navigate('/quiz-result', {
      state: {
        score,
        total: questions.length,
        courseKey,
        lessonId
      }
    });
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 text-white p-6">
      <AnimatedBackground />

      <div className="relative z-10 max-w-3xl mx-auto">
        <nav className="flex justify-between items-center mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex gap-2 items-center text-white/60 hover:text-white"
            >
              <FaArrowLeft />
              Dashboard
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex gap-2 items-center text-white/60 hover:text-white"
            >
              Exit
            </button>
          </div>

          <div className="bg-white/5 px-4 py-2 rounded-full">
            Question {index + 1}/{questions.length}
          </div>
        </nav>

        <div className="w-full bg-white/10 h-3 rounded-full mb-8">
          <div
            className="bg-sky-500 h-3 rounded-full"
            style={{
              width: `${((index + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        <div className="bg-white/5 rounded-3xl border border-white/10 p-8">
          <p className="text-sm text-sky-400 mb-2">{courseKey || "Quiz"}</p>

          <h2 className="text-2xl font-bold mb-8">{q.question}</h2>

          <div className="space-y-4">
            {q.options.map((option, i) => (
              <button
                key={i}
                disabled={answered}
                onClick={() => setSelected(i)}
                className={`
w-full p-4 rounded-xl text-left border-2 transition-all

${
  answered
    ? i === q.correctAnswer
      ? "border-green-500 bg-green-500/10"
      : i === selected
        ? "border-red-500 bg-red-500/10"
        : "border-white/10 opacity-40"
    : selected === i
      ? "border-sky-500 bg-sky-500/10"
      : "border-white/10 hover:border-white/30"
}
`}
              >
                {option}
              </button>
            ))}
          </div>

          {answered && (
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <FaRegLightbulb className="inline mr-2 text-yellow-400" />
              {q.explanation}
            </div>
          )}

          {showAI && !answered && (
            <GeminiPanel
              question={q.question}
              onClose={() => setShowAI(false)}
            />
          )}

          <div className="mt-8 flex justify-between items-center">
            {!answered && (
              <button
                onClick={() => setShowAI(!showAI)}
                className="text-sky-400 flex gap-2 items-center"
              >
                <FaRobot />
                {showAI ? "Hide AI" : "Ask Gemini"}
              </button>
            )}

            <div className="ml-auto">
              {!answered ? (
                <Button onClick={checkAnswer} disabled={selected === null}>
                  Check Answer
                </Button>
              ) : (
                <Button onClick={nextQuestion}>
                  {index === questions.length - 1
                    ? "Finish Quiz"
                    : "Next Question"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
