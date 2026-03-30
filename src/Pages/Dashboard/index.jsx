import React from "react";
import { useNavigate } from "react-router-dom";
import { Cpu } from "lucide-react";
import {
  FaChevronRight,
  FaHtml5,
  FaCss3Alt,
  FaJsSquare,
  FaPython,
  FaTerminal,
  FaLaptopCode,
  FaCode,
  FaDatabase,
  FaServer,
  FaGlobe,
  FaCog,
} from "react-icons/fa";
import { SiCplusplus, SiReact } from "react-icons/si";
import { LuBookOpenCheck } from "react-icons/lu";

// --- ANIMATED BACKGROUND (Icons made more visible) ---
const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
      <div className="absolute top-[10%] left-[5%] animate-[spin_20s_linear_infinite] hidden sm:block">
        <FaCode size={120} className="text-white/30" />
      </div>
      <div className="absolute top-[60%] right-[10%] animate-[spin_25s_linear_infinite_reverse] hidden md:block">
        <FaCog size={100} className="text-blue-200/30" />
      </div>
      <div className="absolute bottom-[15%] left-[10%] sm:left-[15%] animate-bounce duration-[5000ms]">
        <FaDatabase size={60} className="sm:size-80 text-white/20" />
      </div>
      <div className="absolute top-[20%] right-[15%] animate-[spin_30s_linear_infinite] hidden lg:block">
        <FaServer size={110} className="text-blue-100/20" />
      </div>
      <div className="absolute top-[35%] left-[35%] animate-pulse hidden sm:block">
        <FaGlobe size={100} className="sm:size-150 text-white/10" />
      </div>
    </div>
  );
};

// --- INDIVIDUAL LEARNING BOX WITH SIDE DROPDOWN ---
const LearningBox = ({ title, desc, icon, gradient }) => {
  const lessons = [
    "Lesson 1: Introduction",
    "Lesson 2: Core Concepts",
    "Lesson 3: Advanced Logic",
    "Lesson 4: Best Practices",
    "Lesson 5: Project Build",
  ];

  return (
    <div className="group relative z-10 hover:z-50 bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer shadow-xl h-full">
      {/* Main Content */}
      <div className="relative z-10">
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg bg-gradient-to-br ${gradient}`}
        >
          <span className="text-white">{icon}</span>
        </div>
        <h4 className="text-xl sm:text-2xl font-bold text-white mb-2">
          {title}
        </h4>
        <p className="text-blue-50/80 text-sm sm:text-base leading-relaxed mb-6">
          {desc}
        </p>
        <div className="flex items-center text-white text-sm font-bold">
          View Path <FaChevronRight size={14} className="ml-1" />
        </div>
      </div>

      {/* --- SIDE DROPDOWN (Positioned strictly to the right) --- */}
      <div className="absolute top-0 left-[80%] h-full w-64 pl-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:left-[30%] transition-all duration-300 z-50">
        <div className="h-full bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-3 flex flex-col justify-center">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3 px-3">
            Curriculum
          </p>
          <ul className="space-y-1">
            {lessons.map((lesson, index) => (
              <li
                key={index}
                className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-blue-600/20 text-white/90 hover:text-white transition-all group/item"
              >
                <span className="text-xs font-medium truncate">{lesson}</span>
                <FaChevronRight
                  size={10}
                  className="text-white/30 group-hover/item:text-blue-400 transform transition-transform group-hover/item:translate-x-1 flex-shrink-0 ml-2"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD PAGE ---
const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen pb-24 bg-gradient-to-br from-blue-900 via-blue-600 to-blue-400 overflow-x-hidden">
      <AnimatedBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        {/* 1. Welcome Section */}
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

        {/* 2. Learning Paths */}
        <div className="mb-20">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="w-8 h-1 bg-white rounded-full"></span>
            Courses
            <span className="w-8 h-1 bg-white rounded-full"></span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 overflow-visible">
            <LearningBox
              title="HTML5"
              desc="The backbone of the web. Learn semantic structure and SEO basics."
              icon={<FaHtml5 size={28} />}
              gradient="from-orange-500 to-red-600"
            />
            <LearningBox
              title="CSS3"
              desc="Master layouts with Flexbox, Grid, and beautiful animations."
              icon={<FaCss3Alt size={28} />}
              gradient="from-blue-500 to-indigo-600"
            />
            <LearningBox
              title="JavaScript"
              desc="Logic and interactivity. Master ES6+, Async, and the DOM."
              icon={<FaJsSquare size={28} />}
              gradient="from-yellow-400 to-orange-500"
            />
            <LearningBox
              title="Python"
              desc="Versatile and powerful. From data science to web backends."
              icon={<FaPython size={28} />}
              gradient="from-blue-400 to-blue-600"
            />
            <LearningBox
              title="C++"
              desc="High-performance programming and system architecture."
              icon={<SiCplusplus size={28} />}
              gradient="from-blue-700 to-indigo-800"
            />
            <LearningBox
              title="React"
              desc="Build dynamic, component-based user interfaces."
              icon={<SiReact size={28} />}
              gradient="from-cyan-400 to-blue-500"
            />
          </div>
        </div>

        {/* 3. Extras Section */}
        <section className="relative z-0">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="w-8 h-1 bg-yellow-400 rounded-full"></span>
            Extras
            <span className="w-8 h-1 bg-yellow-400 rounded-full"></span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
              <FaTerminal
                size={140}
                className="absolute -right-8 -bottom-8 text-slate-800 rotate-12 group-hover:text-slate-700 transition-colors duration-500"
              />
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
