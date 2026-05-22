import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUsers, FaComment, FaFire, FaStar } from "react-icons/fa";

const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-60">
    <div className="absolute top-[10%] left-[5%] animate-[spin_20s_linear_infinite] hidden sm:block">
      <FaUsers size={120} className="text-white/60" />
    </div>
  </div>
);

const CommunityPage = () => {
  const navigate = useNavigate();

  const discussions = [
    {
      title: "Best practices for React hooks?",
      author: "DevMaster",
      replies: 24,
      views: 156,
      category: "React",
      hot: true,
    },
    {
      title: "CSS Grid vs Flexbox - when to use which?",
      author: "CSSNinja",
      replies: 18,
      views: 203,
      category: "CSS",
      hot: false,
    },
    {
      title: "JavaScript async/await explained simply",
      author: "JSWizard",
      replies: 31,
      views: 289,
      category: "JavaScript",
      hot: true,
    },
    {
      title: "Python for data science - beginner resources",
      author: "PyLearner",
      replies: 15,
      views: 134,
      category: "Python",
      hot: false,
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
          <div>
            <h1 className="text-3xl text-white font-bold tracking-tight">Community Forum</h1>
            <p className="text-blue-200 text-sm mt-1">Connect, learn, and grow with fellow developers</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="text-3xl font-bold text-white">12.5K</div>
            <div className="text-blue-200 text-sm">Members</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="text-3xl font-bold text-white">3.2K</div>
            <div className="text-blue-200 text-sm">Discussions</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="text-3xl font-bold text-white">45K</div>
            <div className="text-blue-200 text-sm">Replies</div>
          </div>
        </div>

        {/* New Discussion Button */}
        <button className="w-full sm:w-auto mb-8 px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-all">
          Start New Discussion
        </button>

        {/* Discussions List */}
        <div className="space-y-4">
          {discussions.map((discussion, index) => (
            <div
              key={index}
              className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {discussion.hot && (
                      <span className="flex items-center gap-1 text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full">
                        <FaFire size={10} />
                        Hot
                      </span>
                    )}
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                      {discussion.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{discussion.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-blue-200">
                    <span>by {discussion.author}</span>
                    <span className="flex items-center gap-1">
                      <FaComment size={12} />
                      {discussion.replies} replies
                    </span>
                    <span>{discussion.views} views</span>
                  </div>
                </div>
                <FaStar className="text-yellow-400" size={16} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default CommunityPage;
