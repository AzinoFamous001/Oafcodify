import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaCopy,
  FaTerminal,
  FaLaptopCode,
  FaPython,
  FaJsSquare,
  FaBook,
  FaLightbulb,
  FaExternalLinkAlt,
  FaBullseye,
  FaTools,
  FaQuestionCircle,
  FaCode,
} from "react-icons/fa";
import { SiReact } from "react-icons/si";
import Button from "../../Shared/Buttons";

// ✅ Ensure this path matches your file structure
import lesson1 from "../../api/lessons/HTML5/lesson1.json";
import lesson2 from "../../api/lessons/HTML5/lesson2.json";
import lesson3 from "../../api/lessons/HTML5/lesson3.json";
import lesson4 from "../../api/lessons/HTML5/lesson4.json";
import lesson5 from "../../api/lessons/HTML5/lesson5.json";
import jsLesson1 from "../../api/lessons/JavaScript/lesson1.json";
import jsLesson2 from "../../api/lessons/JavaScript/lesson2.json";
import jsLesson3   from "../../api/lessons/JavaScript/lesson3.json";
import jsLesson4 from "../../api/lessons/JavaScript/lesson4.json";
import jsLesson5 from "../../api/lessons/JavaScript/lesson5.json";
import pyLesson1 from "../../api/lessons/Python/lesson1.json";
import pyLesson2 from "../../api/lessons/Python/lesson2.json";
import pyLesson3 from "../../api/lessons/Python/lesson3.json";
import pyLesson4 from "../../api/lessons/Python/lesson4.json";
import pyLesson5 from "../../api/lessons/Python/lesson5.json";
import csLesson1 from "../../api/lessons/CSS/lesson1.json";
import csLesson2 from "../../api/lessons/CSS/lesson2.json";
import csLesson3 from "../../api/lessons/CSS/lesson3.json";
import csLesson4 from "../../api/lessons/CSS/lesson4.json";
import csLesson5 from "../../api/lessons/CSS/lesson5.json";
import cppLesson1 from "../../api/lessons/C++/lesson1.json";
import cppLesson2 from "../../api/lessons/C++/lesson2.json";
import cppLesson3 from "../../api/lessons/C++/lesson3.json";
import cppLesson4 from "../../api/lessons/C++/lesson4.json";
import cppLesson5 from "../../api/lessons/C++/lesson5.json";
import reactlesson1 from "../../api/lessons/React/lesson1.json";
import reactlesson2 from "../../api/lessons/React/lesson2.json";
import reactlesson3 from "../../api/lessons/React/lesson3.json";
import reactlesson4 from "../../api/lessons/React/lesson4.json";
import reactlesson5 from "../../api/lessons/React/lesson5.json";


const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-60">
      <div className="absolute top-[10%] left-[5%] animate-[spin_20s_linear_infinite] hidden sm:block">
        <FaLaptopCode size={120} className="text-white/60" />
      </div>
      <div className="absolute top-[60%] right-[10%] animate-[spin_25s_linear_infinite_reverse] hidden md:block">
        <FaTerminal size={100} className="text-blue-200/60" />
      </div>
      <div className="absolute bottom-[15%] left-[10%] animate-bounce duration-[5000ms]">
        <FaPython size={80} className="text-white/50" />
      </div>
      <div className="absolute top-[20%] right-[15%] animate-[spin_30s_linear_infinite] hidden lg:block">
        <SiReact size={110} className="text-blue-100/55" />
      </div>
      <div className="absolute top-[45%] left-[38%] animate-pulse hidden sm:block">
        <FaJsSquare size={90} className="text-white/35" />
      </div>
    </div>
  );
};

// Helper function to check if a lesson is unlocked
const isLessonUnlocked = (courseKey, lessonId) => {
  // Lesson 1 is always unlocked
  if (parseInt(lessonId) === 1) return true;

  const userId = sessionStorage.getItem('currentUserId');
  if (!userId) return false;

  // Check if this specific lesson has been explicitly unlocked
  const unlockKey = `${userId}_${courseKey}_lesson_${lessonId}_unlocked`;
  const isExplicitlyUnlocked = localStorage.getItem(unlockKey) === 'true';
  if (isExplicitlyUnlocked) return true;

  const prevLessonNumber = parseInt(lessonId) - 1;

  // Check if previous lesson is completed
  const lessonKey = `${userId}_${courseKey}_lesson_${prevLessonNumber}_completed`;
  const lessonCompleted = localStorage.getItem(lessonKey);

  // Check if previous quiz is completed with 60%+ score (user-specific storage)
  const quizResultsKey = `quizResults_${userId}`;
  const quizResults = JSON.parse(localStorage.getItem(quizResultsKey) || '[]');
  const prevQuizResult = quizResults.find(
    r => r.userId === userId && r.courseKey === courseKey && r.lessonId === prevLessonNumber
  );

  const quizPassed = prevQuizResult && prevQuizResult.percentage >= 60;

  return lessonCompleted && quizPassed;
};

const LessonPage = () => {
  const { lessonId, courseKey } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [completedTopics, setCompletedTopics] = useState([]);

  useEffect(() => {
    setLoading(true);

    let lessonsData = [];

    // ✅ LOAD BASED ON COURSE
    if (courseKey === "HTML5") {
      lessonsData = [
        ...lesson1,
        ...lesson2,
        ...lesson3,
        ...lesson4,
        ...lesson5,
      ];
    } else if (courseKey === "JavaScript") {
      lessonsData = [
        ...jsLesson1,
        ...jsLesson2,
        ...jsLesson3,
        ...jsLesson4,
        ...jsLesson5,
      ];
    } else if (courseKey === "Python") {
      lessonsData = [
        ...pyLesson1,
        ...pyLesson2,
        ...pyLesson3,
        ...pyLesson4,
        ...pyLesson5,
      ];
     
    }
    else if (courseKey === "CSS3") {
     lessonsData = [
        ...csLesson1,
        ...csLesson2,
        ...csLesson3,
        ...csLesson4,
        ...csLesson5,
     ];
    } else if (courseKey === "C++") {
      lessonsData = [
         ...cppLesson1,
        ...cppLesson2,
        ...cppLesson3,
        ...cppLesson4,
        ...cppLesson5,
      ];
    } else if (courseKey === "React") {
      lessonsData = [
         ...reactlesson1,
        ...reactlesson2,
        ...reactlesson3,
        ...reactlesson4,
        ...reactlesson5,
      ];
    }

    const found = lessonsData.find((l) => String(l.id) === String(lessonId));

    if (found) {
      setLesson(found);
    }

    setLoading(false);
  }, [lessonId, courseKey]);

  // Check if lesson is locked
  useEffect(() => {
    if (lessonId && courseKey) {
      setIsLocked(!isLessonUnlocked(courseKey, lessonId));
    }
  }, [lessonId, courseKey]);

  // Auto-scroll to top on page mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [lessonId, courseKey]);

  const handleCopyCode = (code, identifier) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(identifier);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const extractCodeBlocks = (content) => {
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.substring(lastIndex, match.index),
        });
      }
      parts.push({
        type: "code",
        language: match[1] || "html",
        code: match[2].trim(),
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({ type: "text", content: content.substring(lastIndex) });
    }
    return parts;
  };

  const renderContent = (content, topicIndex) => {
    const parts = extractCodeBlocks(content);

    return parts.map((part, idx) => {
      if (part.type === "text") {
        const formattedText = part.content
          .replace(
            /\*\*(.*?)\*\*/g,
            '<strong class="text-white font-bold">$1</strong>',
          )
          .replace(/\*(.*?)\*/g, '<em class="text-blue-100">$1</em>');

        return (
          <div
            key={idx}
            className="text-blue-50 leading-loose mb-10 text-lg whitespace-pre-line font-normal tracking-wide"
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />
        );
      } else {
        return (
          <div key={idx} className="relative mb-10 group">
            <div className="absolute top-0 left-4 -translate-y-1/2 z-10">
              <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                {part.language}
              </span>
            </div>
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={() =>
                  handleCopyCode(part.code, `${topicIndex}-${idx}`)
                }
                className="bg-gray-800 hover:bg-gray-700 text-white p-2.5 rounded-xl transition-all border border-white/10 shadow-md"
              >
                <FaCopy size={16} />
              </button>
            </div>
            <pre className="bg-slate-950 text-blue-100 pt-8 pb-5 px-5 rounded-2xl overflow-x-auto text-sm border border-blue-400/30 shadow-2xl">
              <code className="font-mono">{part.code}</code>
            </pre>
            {copiedCode === `${topicIndex}-${idx}` && (
              <div className="absolute top-3 right-16 bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-bold">
                Copied!
              </div>
            )}
          </div>
        );
      }
    });
  };

  if (loading) return null;
  if (!lesson)
    return (
      <div className="text-white text-center mt-20">Lesson not found.</div>
    );

  // Show locked state if lesson is locked
  if (isLocked) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 flex items-center justify-center">
        <AnimatedBackground />
        <div className="relative z-10 max-w-md mx-auto px-4 text-center">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-10">
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="text-3xl font-black text-white mb-4">Lesson Locked</h1>
            <p className="text-blue-100 mb-6 leading-relaxed">
              You need to score at least 60% on the previous lesson's quiz to unlock this lesson.
            </p>
            <Button
              size="lg"
              onClick={() => navigate(`/quiz/${courseKey}/${parseInt(lessonId) - 1}`)}
              className="w-full flex items-center justify-center gap-2"
            >
              <FaQuestionCircle /> Take Previous Lesson Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 pb-20 overflow-x-hidden">
      <AnimatedBackground />

      {/* Navigation */}
      <nav className="sticky top-0 z-9 bg-white/10 backdrop-blur-md border-b border-white/20 py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white hover:text-blue-200 font-medium transition-colors"
          >
            <FaArrowLeft />{" "}
            <span className="hidden sm:inline">Back to dashboard</span>
          </button>
          <div className="flex items-center gap-4">
            <Button
              size="sm"
              onClick={() => navigate("/editor")}
              className="bg-white text-blue-900 hover:bg-blue-50"
            >
              Practice Now
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-4 pt-12">
        {/* Lesson Header */}
        <header className="text-center mb-12">
          <span className="px-4 py-1 bg-white/10 text-white rounded-full text-sm font-semibold mb-6 backdrop-blur-sm border border-white/10">
            {lesson.level} • {lesson.duration}
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mt-6 mb-4 drop-shadow-lg tracking-tight">
            {lesson.title}
          </h1>
          <p className="text-lg text-blue-50 max-w-2xl mx-auto leading-relaxed">
            {lesson.description}
          </p>
        </header>

        {/* ✅ LEARNING OBJECTIVES SECTION */}
        {lesson.learningObjectives && (
          <div className="mb-16 bg-blue-900/30 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 md:p-10">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <FaBullseye className="text-blue-300" /> What you will learn
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lesson.learningObjectives.map((obj, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 text-blue-100/90 text-sm md:text-base"
                >
                  <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                  </div>
                  {obj}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subtopics */}
        <div className="space-y-16">
          {lesson.subtopics?.map((topic, index) => (
            <section
              key={index}
              className="bg-blue-950/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="bg-white/5 px-8 py-6 flex items-start border-b border-white/10 gap-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-4">
                  <span className="text-blue-300 text-3xl font-black">
                    {index + 1}.
                  </span>
                  {topic.title}
                </h2>
                {completedTopics.includes(index) && (
                  <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white shadow-lg font-bold">
                    <FaCheckCircle />
                    <span className="text-sm">Completed</span>
                  </div>
                )}
              </div>
              <div className="p-8 md:p-12">
                {renderContent(topic.content, index)}
                {topic.realWorldAnalogy && (
                  <div className="mt-8 bg-yellow-400/10 border border-yellow-400/30 rounded-3xl p-6 flex gap-4">
                    <FaLightbulb
                      className="text-yellow-400 shrink-0 mt-1"
                      size={24}
                    />
                    <div>
                      <h4 className="text-yellow-300 font-bold mb-1 text-sm uppercase tracking-wider">
                        Concept Analogy
                      </h4>
                      <p className="text-yellow-50/90 leading-relaxed italic">
                        {topic.realWorldAnalogy}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>

        {/* Glossary & Resources */}
        <div className="mt-24 space-y-12">
          {/* Recommended Tools */}
          {lesson.resources?.recommendedTools && (
            <section className="bg-blue-900/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaTools className="text-blue-300" /> Recommended Tools
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lesson.resources.recommendedTools.map((tool, i) => (
                  <a
                    key={i}
                    href={tool.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-5 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/5 transition-all group"
                  >
                    <div>
                      <p className="text-white font-bold text-sm group-hover:text-blue-300 transition-colors">
                        {tool.name}
                      </p>
                      <p className="text-blue-100/60 text-xs mt-1">
                        {tool.reason}
                      </p>
                    </div>
                    <FaExternalLinkAlt
                      className="text-white/20 group-hover:text-white transition-colors"
                      size={14}
                    />
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Glossary */}
          {lesson.glossary && (
            <section className="bg-blue-950/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/10 shadow-2xl">
              <h3 className="text-3xl font-black text-white mb-8 flex items-center gap-3">
                <FaBook className="text-blue-400" /> Glossary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {lesson.glossary.map((item, i) => (
                  <div key={i} className="border-l-2 border-blue-500/30 pl-6">
                    <p className="text-blue-300 font-bold text-lg mb-2">
                      {item.term}
                    </p>
                    <p className="text-blue-50/80 leading-relaxed text-sm font-light">
                      {item.definition}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ✅ ADDED BUTTONS SECTION */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
          <Button
            size="lg"
            onClick={() => navigate(`/quiz/${courseKey}/${lessonId}`)}
            className="w-full sm:w-auto flex items-center gap-2 !rounded-xl shadow-lg"
          >
            <FaQuestionCircle /> Take Lesson Quiz
          </Button>

          <Button
            size="lg"
            onClick={() => navigate("/editor")}
            className="w-full sm:w-auto flex items-center gap-2 !bg-white !text-blue-900 hover:!bg-blue-50 !rounded-xl shadow-lg"
          >
            <FaCode /> Open Code Editor
          </Button>
        </div>
      </main>
    </div>
  );
};

export default LessonPage;
