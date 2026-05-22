import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaChevronLeft,
  FaHtml5,
  FaCss3Alt,
  FaJsSquare,
  FaPython,
  FaYoutube,
  FaCode,
  FaCog,
  FaDatabase,
  FaServer,
  FaGlobe,
} from "react-icons/fa";
import { SiCplusplus, SiReact } from "react-icons/si";

const videos = {
  HTML5: [
    { id: "pQN-pnXPaVg", title: "HTML5 Crash Course for Beginners" },
    { id: "kUMe1FH4CHE", title: "HTML Full Course - Beginner to Pro" },
    { id: "qz0aGYrrlhU", title: "HTML5 Tutorial for Beginners" },
  ],
  CSS3: [
    { id: "1Rs2ND1ryYc", title: "CSS Crash Course For Beginners" },
    { id: "yfoY53QXEnI", title: "CSS Full Course - Beginner to Pro" },
    { id: "ox-qzAGk3t8", title: "CSS3 Tutorial for Beginners" },
  ],
  JavaScript: [
    { id: "PkZNo7MFNFg", title: "JavaScript Crash Course for Beginners" },
    { id: "W6NZfCO5SIk", title: "JavaScript Full Course - Beginner to Pro" },
    { id: "hdkI0Z9enGc", title: "JavaScript Tutorial for Beginners" },
  ],
  Python: [
    { id: "rfscVS0vtbw", title: "Python Crash Course for Beginners" },
    { id: "QT1XoJ2nj3g", title: "Python Full Course - Beginner to Pro" },
    { id: "kqtD5dpn9C8", title: "Python Tutorial for Beginners" },
  ],
  "C++": [
    { id: "vLnPwxZdW4Y", title: "C++ Crash Course for Beginners" },
    { id: "8jLOx1h3CsU", title: "C++ Full Course - Beginner to Pro" },
    { id: "ZzaPdXTrSb8", title: "C++ Tutorial for Beginners" },
  ],
  React: [
    { id: "SqcY0GlETPk", title: "React Crash Course for Beginners" },
    { id: "w7ejDZ8SWv8", title: "React Full Course - Beginner to Pro" },
    { id: "Ke90Tje7VS0", title: "React Tutorial for Beginners" },
  ],
};

const courseIcons = {
  HTML5: <FaHtml5 size={24} />,
  CSS3: <FaCss3Alt size={24} />,
  JavaScript: <FaJsSquare size={24} />,
  Python: <FaPython size={24} />,
  "C++": <SiCplusplus size={24} />,
  React: <SiReact size={24} />,
};

const courseGradients = {
  HTML5: "from-orange-500 to-red-600",
  CSS3: "from-blue-500 to-indigo-600",
  JavaScript: "from-yellow-400 to-orange-500",
  Python: "from-blue-400 to-blue-600",
  "C++": "from-blue-700 to-indigo-800",
  React: "from-cyan-400 to-blue-500",
};

const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-60">
    <div className="absolute top-[10%] left-[5%] animate-[spin_20s_linear_infinite]">
      <FaCode size={120} className="text-white/20" />
    </div>
    <div className="absolute top-[60%] right-[10%] animate-[spin_25s_linear_infinite_reverse]">
      <FaCog size={100} className="text-blue-200/20" />
    </div>
    <div className="absolute bottom-[15%] left-[15%] animate-bounce duration-[5000ms]">
      <FaDatabase size={80} className="text-white/10" />
    </div>
    <div className="absolute top-[20%] right-[20%] animate-[spin_30s_linear_infinite]">
      <FaServer size={110} className="text-blue-100/10" />
    </div>
    <div className="absolute top-[40%] left-[40%] animate-pulse">
      <FaGlobe size={150} className="text-white/5" />
    </div>
  </div>
);

const VideosPage = () => {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState("HTML5");
  const [selectedVideo, setSelectedVideo] = useState(videos.HTML5[0]);

  const handleCourseChange = (course) => {
    setSelectedCourse(course);
    setSelectedVideo(videos[course][0]);
  };

  const handleVideoChange = (video) => {
    setSelectedVideo(video);
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900">
      <AnimatedBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 transition-all"
          >
            <FaChevronLeft size={18} />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-xl">
              <FaYoutube size={24} className="text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Video Tutorials
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-0">
          {/* Video Player */}
          <div className="lg:col-span-2 relative z-0">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10">
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${selectedVideo.id}`}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-2">
                  {selectedVideo.title}
                </h2>
                <p className="text-slate-400">
                  {selectedCourse} Course - Video Tutorial
                </p>
              </div>
            </div>
          </div>

          {/* Course Selection */}
          <div className="space-y-4 relative z-10">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">Select Course</h3>
              <div className="space-y-2">
                {Object.keys(videos).map((course) => (
                  <button
                    key={course}
                    onClick={() => handleCourseChange(course)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      selectedCourse === course
                        ? `bg-gradient-to-r ${courseGradients[course]} text-white shadow-lg`
                        : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      selectedCourse === course ? "bg-white/20" : "bg-white/10"
                    }`}>
                      {courseIcons[course]}
                    </div>
                    <span className="font-medium">{course}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Video List */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">
                {selectedCourse} Videos
              </h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {videos[selectedCourse].map((video, index) => (
                  <button
                    key={video.id}
                    onClick={() => handleVideoChange(video)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                      selectedVideo.id === video.id
                        ? `bg-gradient-to-r ${courseGradients[selectedCourse]} text-white shadow-lg`
                        : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-20 h-12 bg-slate-700 rounded-lg overflow-hidden">
                        <img
                          src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2">
                          {video.title}
                        </p>
                        <p className="text-xs opacity-70 mt-1">
                          Video {index + 1}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default VideosPage;
