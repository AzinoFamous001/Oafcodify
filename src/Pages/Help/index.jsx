import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaQuestionCircle, FaSearch, FaBook } from "react-icons/fa";

const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-60">
    <div className="absolute top-[10%] left-[5%] animate-[spin_20s_linear_infinite] hidden sm:block">
      <FaQuestionCircle size={120} className="text-white/60" />
    </div>
  </div>
);

const HelpPage = () => {
  const navigate = useNavigate();

  const helpCategories = [
    {
      title: "Getting Started",
      articles: [
        "How to create an account",
        "Navigating the dashboard",
        "Starting your first lesson",
        "Taking quizzes",
      ],
    },
    {
      title: "Account & Settings",
      articles: [
        "Updating your profile",
        "Changing your password",
        "Managing notifications",
        "Deleting your account",
      ],
    },
    {
      title: "Courses & Lessons",
      articles: [
        "Course structure explained",
        "Lesson completion requirements",
        "Quiz scoring system",
        "Certificate of completion",
      ],
    },
    {
      title: "Billing & Subscription",
      articles: [
        "Pricing plans explained",
        "How to upgrade",
        "Managing your subscription",
        "Requesting a refund",
      ],
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
            <h1 className="text-3xl text-white font-bold tracking-tight">Help Center</h1>
            <p className="text-blue-200 text-sm mt-1">Find answers to your questions</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-12">
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search for help articles..."
              className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 px-6 text-white placeholder-blue-200/50 focus:outline-none focus:border-blue-500 transition-all"
            />
            <FaSearch className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-200/50" size={20} />
          </div>
        </div>

        {/* Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {helpCategories.map((category, index) => (
            <div
              key={index}
              className="relative z-10 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-xl"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaBook className="text-blue-400" />
                {category.title}
              </h3>
              <ul className="space-y-3">
                {category.articles.map((article, i) => (
                  <li
                    key={i}
                    className="text-sm text-blue-100 hover:text-white cursor-pointer transition-colors"
                  >
                    {article}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-12 bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-2">Still need help?</h3>
          <p className="text-blue-200 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <button
            onClick={() => navigate("/contact")}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-all"
          >
            Contact Support
          </button>
        </div>
      </div>
    </main>
  );
};

export default HelpPage;
