import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, BookOpen } from "lucide-react";
import { FaHtml5, FaJsSquare, FaPython } from "react-icons/fa";

// Import lesson data
import lesson1 from "../../api/lessons/HTML5/lesson1.json";
import lesson2 from "../../api/lessons/HTML5/lesson2.json";
import lesson3 from "../../api/lessons/HTML5/lesson3.json";
import lesson4 from "../../api/lessons/HTML5/lesson4.json";
import lesson5 from "../../api/lessons/HTML5/lesson5.json";
import jsLesson1 from "../../api/lessons/JavaScript/lesson1.json";
import jsLesson2 from "../../api/lessons/JavaScript/lesson2.json";
import jsLesson3 from "../../api/lessons/JavaScript/lesson3.json";
import jsLesson4 from "../../api/lessons/JavaScript/lesson4.json";
import jsLesson5 from "../../api/lessons/JavaScript/lesson5.json";
import pyLesson1 from "../../api/lessons/Python/lesson1.json";
import pyLesson2 from "../../api/lessons/Python/lesson2.json";
import pyLesson3 from "../../api/lessons/Python/lesson3.json";
import pyLesson4 from "../../api/lessons/Python/lesson4.json";
import pyLesson5 from "../../api/lessons/Python/lesson5.json";

const SearchModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  // Load all lessons
  const allLessons = [
    ...lesson1.map(l => ({ ...l, course: "HTML5", icon: <FaHtml5 /> })),
    ...lesson2.map(l => ({ ...l, course: "HTML5", icon: <FaHtml5 /> })),
    ...lesson3.map(l => ({ ...l, course: "HTML5", icon: <FaHtml5 /> })),
    ...lesson4.map(l => ({ ...l, course: "HTML5", icon: <FaHtml5 /> })),
    ...lesson5.map(l => ({ ...l, course: "HTML5", icon: <FaHtml5 /> })),
    ...jsLesson1.map(l => ({ ...l, course: "JavaScript", icon: <FaJsSquare /> })),
    ...jsLesson2.map(l => ({ ...l, course: "JavaScript", icon: <FaJsSquare /> })),
    ...jsLesson3.map(l => ({ ...l, course: "JavaScript", icon: <FaJsSquare /> })),
    ...jsLesson4.map(l => ({ ...l, course: "JavaScript", icon: <FaJsSquare /> })),
    ...jsLesson5.map(l => ({ ...l, course: "JavaScript", icon: <FaJsSquare /> })),
    ...pyLesson1.map(l => ({ ...l, course: "Python", icon: <FaPython /> })),
    ...pyLesson2.map(l => ({ ...l, course: "Python", icon: <FaPython /> })),
    ...pyLesson3.map(l => ({ ...l, course: "Python", icon: <FaPython /> })),
    ...pyLesson4.map(l => ({ ...l, course: "Python", icon: <FaPython /> })),
    ...pyLesson5.map(l => ({ ...l, course: "Python", icon: <FaPython /> })),
  ];

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = allLessons.filter(lesson => {
      const titleMatch = lesson.title?.toLowerCase().includes(query);
      const descMatch = lesson.description?.toLowerCase().includes(query);
      const courseMatch = lesson.course?.toLowerCase().includes(query);
      const subtopicMatch = lesson.subtopics?.some(subtopic =>
        subtopic.title?.toLowerCase().includes(query) ||
        subtopic.content?.toLowerCase().includes(query)
      );
      
      return titleMatch || descMatch || courseMatch || subtopicMatch;
    });

    setSearchResults(results.slice(0, 10)); // Limit to 10 results
  }, [searchQuery]);

  const handleLessonClick = (lesson) => {
    navigate(`/lesson/${lesson.course}/${lesson.id}`);
    onClose();
    setSearchQuery("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <Search className="text-gray-400" size={20} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search lessons, topics, or courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none text-gray-800 placeholder-gray-400 text-lg"
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
            }}
          />
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="text-gray-400" size={20} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {searchQuery.trim() === "" ? (
            <div className="p-8 text-center text-gray-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">Start typing to search for lessons</p>
              <p className="text-sm mt-2">Search by lesson title, topic, or course name</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p className="text-lg">No lessons found</p>
              <p className="text-sm mt-2">Try a different search term</p>
            </div>
          ) : (
            <div className="p-2">
              {searchResults.map((lesson, index) => (
                <button
                  key={index}
                  onClick={() => handleLessonClick(lesson)}
                  className="w-full flex items-start gap-4 p-4 rounded-xl hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                    {lesson.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                        {lesson.course}
                      </span>
                      <span className="text-xs text-gray-400">
                        {lesson.level}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-800 truncate">
                      {lesson.title}
                    </h4>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {lesson.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>
            {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-gray-200 rounded text-gray-600 font-mono">ESC</kbd>
              to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
