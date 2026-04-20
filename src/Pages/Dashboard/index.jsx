import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaChevronRight,
  FaHtml5,
  FaCss3Alt,
  FaJsSquare,
  FaPython,
  FaTerminal,
  FaLaptopCode,
} from "react-icons/fa";
import { SiCplusplus, SiReact } from "react-icons/si";
import { LuBookOpenCheck } from "react-icons/lu";
import { Cpu } from "lucide-react";

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
      <div className="absolute top-[35%] left-[35%] animate-pulse hidden sm:block">
        <FaJsSquare size={100} className="text-white/40" />
      </div>
    </div>
  );
};

const LearningBox = ({
  title,
  desc,
  icon,
  gradient,
  courseKey,
  onLessonClick,
}) => {
  const lessons = [
    { name: "Lesson 1: Introduction", number: 1 },
    { name: "Lesson 2: Core Concepts", number: 2 },
    { name: "Lesson 3: Advanced Logic", number: 3 },
    { name: "Lesson 4: Best Practices", number: 4 },
    { name: "Lesson 5: Project Build", number: 5 },
  ];

  return (
    <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-xl h-full min-h-[320px] overflow-visible">
      {/* Main Course Content */}
      <div className="relative z-10 h-full flex flex-col">
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg bg-gradient-to-br ${gradient}`}
        >
          <span className="text-white">{icon}</span>
        </div>
        <h4 className="text-xl sm:text-2xl font-bold text-white mb-3">
          {title}
        </h4>
        <p className="text-blue-50/80 text-sm sm:text-base leading-relaxed mb-auto">
          {desc}
        </p>

        {/* View Curriculum hover trigger */}
        <div className="relative group/curriculum mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center text-white text-sm font-bold cursor-pointer select-none">
            View Curriculum <FaChevronRight size={14} className="ml-1" />
          </div>

          {/* Dropdown — slides up above the row */}
          <div
            className="
              absolute bottom-full left-0 mb-2 w-full min-w-[220px]
              opacity-0 invisible pointer-events-none
              group-hover/curriculum:opacity-100 group-hover/curriculum:visible group-hover/curriculum:pointer-events-auto
              translate-y-2 group-hover/curriculum:translate-y-0
              transition-all duration-200 ease-out
              z-50 bg-slate-900/95 border border-white/10 rounded-2xl p-2 shadow-2xl
            "
          >
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 px-2">
              Select Lesson
            </p>
            <ul className="space-y-1">
              {lessons.map((lesson, index) => (
                <li
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLessonClick(courseKey, lesson.number);
                  }}
                  className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-blue-600/30 text-white/90 hover:text-white transition-all cursor-pointer group/item"
                >
                  <span className="text-sm font-medium">{lesson.name}</span>
                  <FaChevronRight
                    size={12}
                    className="text-white/40 group-hover/item:text-blue-400 transition-transform group-hover/item:translate-x-1"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleLessonClick = (courseKey, lessonNumber) => {
    const courseMap = {
      HTML5: 1,
      CSS3: 2,
      JavaScript: 3,
      Python: 4,
      "C++": 5,
      React: 6,
    };

    const lessonId = courseMap[courseKey] || 1;
    navigate(`/lesson/${lessonId}`);
  };

  return (
    <main className="relative min-h-screen pb-24 bg-gradient-to-br from-blue-900 via-blue-600 to-blue-400 overflow-x-hidden">
      <AnimatedBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        {/* Welcome Section */}
        <section className="flex flex-col md:flex-row items-center gap-6 mb-12 sm:mb-16">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-2xl overflow-hidden ring-4 ring-blue-200/30 flex-shrink-0">
            <img
              src="/Logo_.jpg"
              alt="Dev"
              className="w-full h-full object-cover"
              onError={(e) =>
                (e.target.src =
                  "https://ui-avatars.com/api/?name=Dev&background=0D8ABC&color=fff")
              }
            />
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md leading-tight">
              Welcome back, Developer!
            </h2>
            <p className="text-blue-100 text-base sm:text-lg mt-2 font-medium italic">
              "First, solve the problem. Then, write the code."
            </p>
          </div>
        </section>

        {/* Courses Section */}
        <div className="mb-20">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="w-8 h-1 bg-white rounded-full"></span>
            Available Courses
            <span className="w-8 h-1 bg-white rounded-full"></span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
            <LearningBox
              title="HTML5"
              desc="The backbone of the web. Learn semantic structure and SEO basics. Master forms, multimedia, and modern web standards."
              icon={<FaHtml5 size={28} />}
              gradient="from-orange-500 to-red-600"
              courseKey="HTML5"
              onLessonClick={handleLessonClick}
            />
            <LearningBox
              title="CSS3"
              desc="Master layouts with Flexbox, Grid, and beautiful animations. Learn responsive design, transitions, and modern styling techniques."
              icon={<FaCss3Alt size={28} />}
              gradient="from-blue-500 to-indigo-600"
              courseKey="CSS3"
              onLessonClick={handleLessonClick}
            />
            <LearningBox
              title="JavaScript"
              desc="Logic and interactivity. Master ES6+, Async, and the DOM. Learn closures, promises, and modern JS patterns."
              icon={<FaJsSquare size={28} />}
              gradient="from-yellow-400 to-orange-500"
              courseKey="JavaScript"
              onLessonClick={handleLessonClick}
            />
            <LearningBox
              title="Python"
              desc="Versatile and powerful. From data science to web backends. Master OOP, decorators, and popular frameworks."
              icon={<FaPython size={28} />}
              gradient="from-blue-400 to-blue-600"
              courseKey="Python"
              onLessonClick={handleLessonClick}
            />
            <LearningBox
              title="C++"
              desc="High-performance programming and system architecture. Master memory management, OOP, and data structures."
              icon={<SiCplusplus size={28} />}
              gradient="from-blue-700 to-indigo-800"
              courseKey="C++"
              onLessonClick={handleLessonClick}
            />
            <LearningBox
              title="React"
              desc="Build dynamic, component-based user interfaces. Master hooks, state management, and modern React patterns."
              icon={<SiReact size={28} />}
              gradient="from-cyan-400 to-blue-500"
              courseKey="React"
              onLessonClick={handleLessonClick}
            />
          </div>
        </div>

        {/* Extras Section */}
        <section>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="w-8 h-1 bg-yellow-400 rounded-full"></span>
            Extras
            <span className="w-8 h-1 bg-yellow-400 rounded-full"></span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-13">
            <div
              onClick={() => navigate("/editor")}
              className="group relative overflow-hidden bg-slate-900 rounded-[2rem] p-8 sm:p-10 border border-slate-700 cursor-pointer hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500"
            >
              <div className="relative z-10">
                <div className="bg-blue-500/10 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                  <FaLaptopCode className="text-blue-400" size={32} />
                </div>
                <h4 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  Code Playground
                </h4>
                <p className="text-slate-400 text-base max-w-xs mb-8 leading-relaxed">
                  Test logic in our IDE. Supports JS, Python, and more.
                </p>
                <div className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-bold group-hover:bg-blue-500 transition-colors text-sm">
                  Launch Editor
                </div>
              </div>
            </div>

            <div
              onClick={() => navigate("/quiz")}
              className="group relative overflow-hidden bg-gradient-to-br from-purple-700 to-indigo-900 rounded-[2rem] p-8 sm:p-10 border border-white/10 cursor-pointer hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500"
            >
              <div className="relative z-10">
                <div className="bg-white/10 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                  <LuBookOpenCheck className="text-white" size={32} />
                </div>
                <h4 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  Quick Quiz
                </h4>
                <p className="text-purple-100/70 text-base max-w-xs mb-8 leading-relaxed">
                  Check your knowledge with challenges and earn XP.
                </p>
                <div className="inline-flex items-center px-6 py-3 bg-white text-purple-900 rounded-xl font-bold group-hover:bg-purple-50 transition-colors text-sm">
                  Take a Quiz
                </div>
              </div>
              <Cpu
                size={140}
                className="absolute -right-8 -bottom-8 text-white/5 rotate-12 group-hover:text-white/10 transition-colors duration-500"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default DashboardPage;
