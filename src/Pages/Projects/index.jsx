import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaRocket, FaCode, FaStar, FaLock } from "react-icons/fa";

const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-60">
    <div className="absolute top-[10%] left-[5%] animate-[spin_20s_linear_infinite] hidden sm:block">
      <FaRocket size={120} className="text-white/60" />
    </div>
    <div className="absolute top-[60%] right-[10%] animate-[spin_25s_linear_infinite_reverse] hidden md:block">
      <FaCode size={100} className="text-blue-200/60" />
    </div>
  </div>
);

const ProjectsPage = () => {
  const navigate = useNavigate();

  const projects = [
    {
      title: "Portfolio Builder",
      description: "Create a stunning personal portfolio website with modern design principles.",
      difficulty: "Beginner",
      icon: <FaStar className="text-yellow-400" />,
      status: "Free",
    },
    {
      title: "E-commerce Dashboard",
      description: "Build a complete admin dashboard with charts, tables, and analytics.",
      difficulty: "Intermediate",
      icon: <FaStar className="text-yellow-400" />,
      status: "Pro",
    },
    {
      title: "Social Media App",
      description: "Develop a full-stack social platform with real-time features.",
      difficulty: "Advanced",
      icon: <FaStar className="text-yellow-400" />,
      status: "Pro",
    },
    {
      title: "Weather API Integration",
      description: "Learn to integrate third-party APIs and display dynamic data.",
      difficulty: "Beginner",
      icon: <FaStar className="text-yellow-400" />,
      status: "Free",
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
            <h1 className="text-3xl text-white font-bold tracking-tight">Pro Projects</h1>
            <p className="text-blue-200 text-sm mt-1">Hands-on projects to build your portfolio</p>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <div
              key={index}
              className="relative z-10 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    {project.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{project.title}</h3>
                    <span className="text-xs text-blue-300">{project.difficulty}</span>
                  </div>
                </div>
                {project.status === "Pro" ? (
                  <span className="flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full">
                    <FaLock size={10} />
                    Pro
                  </span>
                ) : (
                  <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full">
                    Free
                  </span>
                )}
              </div>
              <p className="text-blue-50/80 text-sm leading-relaxed">
                {project.description}
              </p>
              <button className="mt-4 w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-all">
                {project.status === "Pro" ? "Upgrade to Access" : "Start Project"}
              </button>
            </div>
          ))}
        </div>

        {/* Upgrade CTA */}
        <div className="mt-12 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-3xl p-8 border border-yellow-500/30">
          <h3 className="text-2xl font-bold text-white mb-2">Unlock All Projects</h3>
          <p className="text-blue-100/80 mb-4">
            Get access to premium projects with detailed guides and mentor support.
          </p>
          <button
            onClick={() => navigate("/pricing")}
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-xl transition-all"
          >
            View Pricing Plans
          </button>
        </div>
      </div>
    </main>
  );
};

export default ProjectsPage;
