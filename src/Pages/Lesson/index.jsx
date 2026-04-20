import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaPlayCircle,
  FaCheckCircle,
  FaCopy,
  FaDownload,
  FaTerminal,
  FaLaptopCode,
  FaPython,
  FaJsSquare,
  FaBook,
  FaLightbulb,
  FaExclamationTriangle,
  FaTools,
} from "react-icons/fa";
import { SiReact } from "react-icons/si";
import Button from "../../Shared/Buttons";

// ✅ Import JSON — adjust path if your folder structure differs
import lessonsData from "../../../public/api/lessons/lesson1.json";

// ==================== ANIMATED BACKGROUND ====================
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

// ==================== LESSON PAGE ====================
const LessonPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedTopics, setCompletedTopics] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);

  // ✅ Load lesson — coerce both sides to string so "1" === "1" always matches
  useEffect(() => {
    setLoading(true);

    const found = lessonsData.find((l) => String(l.id) === String(lessonId));

    if (found) {
      setLesson(found);
      const saved = localStorage.getItem(`lesson_${lessonId}_completed`);
      if (saved) {
        try {
          setCompletedTopics(JSON.parse(saved));
        } catch {
          setCompletedTopics([]);
        }
      }
    } else {
      setLesson(null);
    }

    setLoading(false);
  }, [lessonId]);

  const handleMarkComplete = (topicIndex) => {
    let updated = [...completedTopics];
    if (completedTopics.includes(topicIndex)) {
      updated = updated.filter((i) => i !== topicIndex);
    } else {
      updated.push(topicIndex);
    }
    setCompletedTopics(updated);
    localStorage.setItem(
      `lesson_${lessonId}_completed`,
      JSON.stringify(updated),
    );
  };

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
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>");

        return (
          <div
            key={idx}
            className="text-gray-200 leading-relaxed mb-4 whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />
        );
      } else {
        return (
          <div key={idx} className="relative mb-6 group">
            {/* Language badge */}
            <div className="absolute top-0 left-4 -translate-y-1/2 z-10">
              <span className="bg-blue-500 text-white text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-widest">
                {part.language}
              </span>
            </div>

            <div className="absolute top-2 right-2 z-10 flex gap-2">
              <button
                onClick={() =>
                  handleCopyCode(part.code, `${topicIndex}-${idx}`)
                }
                className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors"
                title="Copy code"
              >
                <FaCopy size={14} />
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([part.code], { type: "text/html" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `example-${topicIndex}-${idx}.html`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors"
                title="Download code"
              >
                <FaDownload size={14} />
              </button>
            </div>

            <pre className="bg-gray-950 text-gray-100 pt-6 pb-4 px-4 rounded-xl overflow-x-auto text-sm border border-gray-700">
              <code>{part.code}</code>
            </pre>

            {copiedCode === `${topicIndex}-${idx}` && (
              <div className="absolute top-2 right-20 bg-green-500 text-white px-2 py-1 rounded text-xs">
                Copied!
              </div>
            )}
          </div>
        );
      }
    });
  };

  const calculateProgress = () => {
    if (!lesson || !lesson.subtopics?.length) return 0;
    return (completedTopics.length / lesson.subtopics.length) * 100;
  };

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-600 to-blue-400 overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading Lesson...</p>
        </div>
      </div>
    );
  }

  // ==================== NOT FOUND STATE ====================
  if (!lesson) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-600 to-blue-400 overflow-hidden text-white">
        <AnimatedBackground />
        <div className="relative z-10 text-center px-6">
          <h2 className="text-3xl font-bold mb-2">Lesson Not Found</h2>
          <p className="mb-2 text-blue-200">
            No lesson found for ID: <strong>{lessonId}</strong>
          </p>
          <p className="mb-6 text-blue-300 text-sm">
            Make sure your JSON file is at{" "}
            <code className="bg-white/10 px-2 py-1 rounded">
              public/api/lessons/lesson1.json
            </code>{" "}
            and the route passes the correct ID.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const allCompleted =
    completedTopics.length === lesson.subtopics?.length &&
    lesson.subtopics?.length > 0;

  // ==================== MAIN RENDER ====================
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-600 to-blue-400 pb-20 overflow-x-hidden">
      <AnimatedBackground />

      {/* Sticky Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 py-4 px-4 md:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white hover:text-blue-200 font-medium transition-colors"
          >
            <FaArrowLeft /> Back to Courses
          </button>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <div className="w-32 bg-white/20 rounded-full h-2">
                <div
                  className="bg-green-400 rounded-full h-2 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm text-white font-medium">
                {Math.round(progress)}% Complete
              </span>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/editor")}
                className="flex items-center gap-2 text-white border-white/30 hover:bg-white/10"
              >
                Open Editor
              </Button>
              {allCompleted ? (
                <Button
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 flex items-center gap-2"
                >
                  <FaCheckCircle /> Completed
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="bg-white text-blue-900 hover:bg-gray-100 flex items-center gap-2"
                >
                  Continue
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 pt-12">
        {/* Lesson Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 bg-white/10 text-white rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
            Level: {lesson.level} • {lesson.duration}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-md">
            {lesson.title}
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            {lesson.description}
          </p>
        </div>

        {/* Progress bar (mobile) */}
        <div className="md:hidden mb-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 flex items-center gap-4">
          <div className="flex-1 bg-white/20 rounded-full h-2">
            <div
              className="bg-green-400 rounded-full h-2 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm text-white font-medium whitespace-nowrap">
            {Math.round(progress)}% Complete
          </span>
        </div>

        {/* Learning Objectives */}
        {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
          <div className="mb-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaBook className="text-blue-300" /> Learning Objectives
            </h2>
            <ul className="space-y-2">
              {lesson.learningObjectives.map((obj, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-blue-100 text-sm"
                >
                  <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ✅ FIXED: Now iterates over lesson.subtopics array correctly */}
        <div className="space-y-12">
          {lesson.subtopics && lesson.subtopics.length > 0 ? (
            lesson.subtopics.map((topic, index) => (
              <section
                key={index}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden shadow-xl"
              >
                {/* Topic Header */}
                <div className="bg-white/5 px-8 py-6 flex items-start justify-between border-b border-white/10 gap-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="text-blue-300 text-3xl">{index + 1}.</span>
                    {topic.title}
                  </h2>
                  <button
                    onClick={() => handleMarkComplete(index)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                      completedTopics.includes(index)
                        ? "bg-green-500 text-white"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    <FaCheckCircle
                      className={
                        completedTopics.includes(index)
                          ? "text-white"
                          : "text-gray-400"
                      }
                    />
                    <span className="text-sm font-medium">
                      {completedTopics.includes(index)
                        ? "Completed"
                        : "Mark Complete"}
                    </span>
                  </button>
                </div>

                <div className="p-8 text-white space-y-6">
                  {/* Main content */}
                  {renderContent(topic.content, index)}

                  {/* Real World Analogy */}
                  {topic.realWorldAnalogy && (
                    <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-2xl p-5 flex gap-3">
                      <FaLightbulb
                        className="text-yellow-400 mt-1 flex-shrink-0"
                        size={18}
                      />
                      <div>
                        <p className="text-yellow-300 font-semibold text-sm mb-1">
                          Real-World Analogy
                        </p>
                        <p className="text-yellow-100 text-sm leading-relaxed">
                          {topic.realWorldAnalogy}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Common Misconceptions */}
                  {topic.commonMisconceptions &&
                    topic.commonMisconceptions.length > 0 && (
                      <div className="bg-red-400/10 border border-red-400/30 rounded-2xl p-5">
                        <p className="text-red-300 font-semibold text-sm mb-3 flex items-center gap-2">
                          <FaExclamationTriangle className="text-red-400" />
                          Common Misconceptions
                        </p>
                        <ul className="space-y-2">
                          {topic.commonMisconceptions.map((m, i) => (
                            <li
                              key={i}
                              className="text-red-100 text-sm flex items-start gap-2"
                            >
                              <span className="mt-1 text-red-400 flex-shrink-0">
                                ✗
                              </span>
                              {m}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Image */}
                  {topic.imageUrl && (
                    <div className="rounded-2xl overflow-hidden border border-white/20 shadow-inner">
                      <img
                        src={topic.imageUrl}
                        alt={topic.title}
                        className="w-full object-cover max-h-[420px] hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* Video */}
                  {topic.videoUrl && (
                    <div className="aspect-video bg-black/40 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-black/60 transition-all">
                      <FaPlayCircle size={70} className="text-blue-400 mb-4" />
                      <span className="text-white/70 text-sm tracking-widest">
                        WATCH VIDEO TUTORIAL
                      </span>
                    </div>
                  )}
                </div>
              </section>
            ))
          ) : (
            <div className="text-center text-white/60 py-20 text-lg">
              No subtopics found for this lesson.
            </div>
          )}
        </div>

        {/* Glossary */}
        {lesson.glossary && lesson.glossary.length > 0 && (
          <div className="mt-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FaBook className="text-blue-300" /> Glossary
            </h2>
            <div className="space-y-4">
              {lesson.glossary.map((item, i) => (
                <div
                  key={i}
                  className="border-b border-white/10 pb-4 last:border-0 last:pb-0"
                >
                  <p className="text-blue-300 font-bold text-sm mb-1">
                    {item.term}
                  </p>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    {item.definition}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resources */}
        {lesson.resources && (
          <div className="mt-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FaTools className="text-blue-300" /> Resources & Tools
            </h2>

            {lesson.resources.recommendedTools &&
              lesson.resources.recommendedTools.length > 0 && (
                <div className="mb-6">
                  <p className="text-blue-300 font-semibold text-sm mb-3 uppercase tracking-widest">
                    Recommended Tools
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {lesson.resources.recommendedTools.map((tool, i) => (
                      <a
                        key={i}
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl p-4 transition-all"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-white font-semibold text-sm">
                            {tool.name}
                          </p>
                          {tool.free && (
                            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full border border-green-400/30">
                              Free
                            </span>
                          )}
                        </div>
                        <p className="text-blue-200/70 text-xs">
                          {tool.reason}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>
              )}

            {lesson.resources.furtherReading &&
              lesson.resources.furtherReading.length > 0 && (
                <div className="mb-6">
                  <p className="text-blue-300 font-semibold text-sm mb-3 uppercase tracking-widest">
                    Further Reading
                  </p>
                  <ul className="space-y-2">
                    {lesson.resources.furtherReading.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-blue-100 text-sm"
                      >
                        <span className="text-blue-400 mt-1">→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {lesson.resources.downloadableCheatsheet && (
              <a
                href={lesson.resources.downloadableCheatsheet}
                download
                className="inline-flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-semibold text-sm transition-colors"
              >
                <FaDownload /> Download Cheatsheet
              </a>
            )}
          </div>
        )}

        {/* Completion Banner */}
        {allCompleted && (
          <div className="mt-16 bg-white/10 backdrop-blur-md border border-green-400/30 rounded-3xl p-10 text-center">
            <FaCheckCircle size={60} className="text-green-400 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-white mb-3">
              🎉 Lesson Completed!
            </h3>
            <p className="text-blue-100 mb-8">
              Excellent work! You've mastered the basics of HTML5.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="bg-green-500 hover:bg-green-600 text-white px-10 py-3 rounded-2xl font-semibold"
            >
              Back to Dashboard
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default LessonPage;
