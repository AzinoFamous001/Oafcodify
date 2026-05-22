import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHtml5, FaCss3Alt, FaJsSquare, FaPython, FaArrowLeft } from "react-icons/fa";
import { SiReact, SiCplusplus } from "react-icons/si";

const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-60">
    <div className="absolute top-[10%] left-[5%] animate-[spin_20s_linear_infinite] hidden sm:block">
      <FaHtml5 size={120} className="text-white/60" />
    </div>
    <div className="absolute top-[60%] right-[10%] animate-[spin_25s_linear_infinite_reverse] hidden md:block">
      <FaCss3Alt size={100} className="text-blue-200/60" />
    </div>
    <div className="absolute bottom-[15%] left-[10%] animate-bounce duration-[5000ms]">
      <FaPython size={80} className="text-white/50" />
    </div>
  </div>
);

const CoursesPage = () => {
  const navigate = useNavigate();

  const courses = [
    {
      id: "HTML5",
      title: "HTML5",
      description: "The backbone of the web. Learn semantic structure and SEO basics.",
      icon: <FaHtml5 size={32} />,
      gradient: "from-orange-500 to-red-600",
      lessons: 5,
    },
    {
      id: "CSS3",
      title: "CSS3",
      description: "Master layouts with Flexbox, Grid, and beautiful animations.",
      icon: <FaCss3Alt size={32} />,
      gradient: "from-blue-500 to-indigo-600",
      lessons: 5,
    },
    {
      id: "JavaScript",
      title: "JavaScript",
      description: "Logic and interactivity. Master ES6+, Async, and the DOM.",
      icon: <FaJsSquare size={32} />,
      gradient: "from-yellow-400 to-orange-500",
      lessons: 5,
    },
    {
      id: "Python",
      title: "Python",
      description: "Versatile and powerful. From data science to web backends.",
      icon: <FaPython size={32} />,
      gradient: "from-blue-400 to-blue-600",
      lessons: 5,
    },
    {
      id: "React",
      title: "React",
      description: "Build modern UI components. Master hooks, state, and JSX.",
      icon: <SiReact size={32} />,
      gradient: "from-cyan-400 to-blue-500",
      lessons: 5,
    },
    {
      id: "C++",
      title: "C++",
      description: "High-performance programming. Master memory management and OOP.",
      icon: <SiCplusplus size={32} />,
      gradient: "from-blue-700 to-indigo-800",
      lessons: 5,
    },
  ];

  return (
    <main className="relative min-h-screen pb-20 bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Header */}
        <div className="flex items-center gap-6 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white hover:bg-white/20 rounded-2xl transition-all"
          >
            <FaArrowLeft size={18} />
          </button>
          <h1 className="text-3xl text-white font-bold tracking-tight">Browse Courses</h1>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => navigate(`/lesson/${course.id}/1`)}
              className="relative z-10 bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer shadow-xl"
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg bg-gradient-to-br ${course.gradient}`}
              >
                <span className="text-white">{course.icon}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{course.title}</h3>
              <p className="text-blue-50/80 text-sm leading-relaxed mb-4">
                {course.description}
              </p>
              <div className="flex items-center justify-between text-sm text-blue-200">
                <span>{course.lessons} Lessons</span>
                <span className="text-white/60">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default CoursesPage;
