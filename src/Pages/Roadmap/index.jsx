import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaMapSigns, FaCheckCircle } from "react-icons/fa";

const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-60">
    <div className="absolute top-[10%] left-[5%] animate-[spin_20s_linear_infinite] hidden sm:block">
      <FaMapSigns size={120} className="text-white/60" />
    </div>
  </div>
);

const RoadmapPage = () => {
  const navigate = useNavigate();

  const roadmaps = [
    {
      title: "Frontend Developer",
      description: "Master HTML, CSS, JavaScript, and modern frameworks",
      steps: [
        "HTML5 & Semantic Structure",
        "CSS3 & Responsive Design",
        "JavaScript Fundamentals",
        "React Framework",
        "State Management",
        "Performance Optimization",
      ],
      duration: "6 months",
    },
    {
      title: "Backend Developer",
      description: "Build server-side applications and APIs",
      steps: [
        "Node.js Basics",
        "Express.js Framework",
        "Database Design",
        "RESTful APIs",
        "Authentication",
        "Deployment",
      ],
      duration: "6 months",
    },
    {
      title: "Full Stack Developer",
      description: "Complete web development mastery",
      steps: [
        "Frontend Fundamentals",
        "Backend Development",
        "Database Integration",
        "API Development",
        "DevOps Basics",
        "Full Stack Projects",
      ],
      duration: "12 months",
    },
  ];

  return (
    <main className="relative min-h-screen pb-20 bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 overflow-x-hidden">
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
          <div>
            <h1 className="text-3xl text-white font-bold tracking-tight">Learning Roadmaps</h1>
            <p className="text-blue-200 text-sm mt-1">Structured paths to achieve your career goals</p>
          </div>
        </div>

        {/* Roadmaps */}
        <div className="space-y-8">
          {roadmaps.map((roadmap, index) => (
            <div
              key={index}
              className="relative z-10 bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-xl"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{roadmap.title}</h3>
                  <p className="text-blue-200 text-sm">{roadmap.description}</p>
                </div>
                <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-4 py-2 rounded-full">
                  {roadmap.duration}
                </span>
              </div>
              <div className="space-y-3">
                {roadmap.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-blue-100">
                    <FaCheckCircle className="text-green-400" size={16} />
                    {step}
                  </div>
                ))}
              </div>
              <button className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all">
                Start This Roadmap
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default RoadmapPage;
