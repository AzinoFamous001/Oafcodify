import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTrophy,
  FaAward,
  FaBookOpen,
  FaMedal,
  FaBolt,
  FaFire,
  FaBrain,
  FaLock,
  FaArrowLeft,
  FaCalendarAlt,
  FaCode,
  FaCog,
  FaDatabase,
  FaServer,
  FaGlobe,
  FaBullseye,
} from "react-icons/fa";
import { MdOutlineAssignmentTurnedIn } from "react-icons/md";

const STREAK_KEY = "quiz_streak_data";

// --- ANIMATED BACKGROUND ---
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-60">
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

const ProfilePage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentStreak, setCurrentStreak] = useState(0);

  const navigate = useNavigate();

  // ✅ FIXED AUTH CHECK
  useEffect(() => {
    const userId = localStorage.getItem("currentUserId");

    if (!userId) {
      navigate("/login");
      return;
    }

    const savedName = localStorage.getItem("userName") || "Developer";
    const savedEmail = localStorage.getItem("userEmail") || "dev@codebay.com";

    const savedResults = localStorage.getItem("quizResults");
    if (savedResults) {
      const parsed = JSON.parse(savedResults);
      setResults(parsed.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }

    setCurrentUser({ name: savedName, email: savedEmail });
  }, [navigate]);

  // --- STREAK ---
  const calculateAndSaveStreak = useCallback((quizResults) => {
    if (!quizResults.length) return 0;

    const dates = new Set(
      quizResults.map((r) => new Date(r.date).toISOString().split("T")[0]),
    );

    let streak = 0;
    let current = new Date();

    while (true) {
      const dateStr = current.toISOString().split("T")[0];

      if (dates.has(dateStr)) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else break;
    }

    localStorage.setItem(STREAK_KEY, JSON.stringify({ streak }));
    return streak;
  }, []);

  useEffect(() => {
    setCurrentStreak(calculateAndSaveStreak(results));
  }, [results, calculateAndSaveStreak]);

  // Stats
  const stats = {
    quizzesTaken: results.length,
    totalPoints: results.reduce((sum, r) => sum + r.score * 10, 0),
    correctAnswers: results.reduce((sum, r) => sum + r.score, 0),
    averageScore:
      results.length > 0
        ? Math.round(
            results.reduce((sum, r) => sum + r.percentage, 0) / results.length,
          )
        : 0,
    rank:
      results.length >= 20
        ? "Gold"
        : results.length >= 10
          ? "Silver"
          : "Bronze",
  };

  const achievements = [
    {
      id: 1,
      title: "First Quiz",
      desc: "Complete your first quiz",
      icon: FaTrophy,
      earned: results.length >= 1,
      gradient: "from-yellow-400 to-orange-500",
    },
    {
      id: 2,
      title: "Perfect Score",
      desc: "Get 100% on any quiz",
      icon: FaAward,
      earned: results.some((r) => r.percentage === 100),
      gradient: "from-blue-400 to-indigo-600",
    },
    {
      id: 3,
      title: "7-Day Streak",
      desc: "Consistency is key",
      icon: FaFire,
      earned: currentStreak >= 7,
      gradient: "from-red-500 to-orange-600",
    },
    {
      id: 4,
      title: "Quick Learner",
      desc: "Complete 10 quizzes",
      icon: FaBrain,
      earned: results.length >= 10,
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  if (!currentUser)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        Loading...
      </div>
    );

  return (
    <main className="relative min-h-screen pb-24 bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 overflow-x-hidden">
      <AnimatedBackground />
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-10">
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-2xl overflow-hidden ring-4 ring-blue-200/30 flex-shrink-0">
                <img
                  src="/Logo_.jpg"
                  alt="Dev"
                  className="w-full h-full object-cover"
                  onError={(e) =>
                    (e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=0D8ABC&color=fff`)
                  }
                />
              </div>

              <div className="absolute -bottom-2 -right-2 bg-yellow-400 p-2 rounded-full border-4 border-slate-900 shadow-lg flex items-center justify-center">
                <FaMedal className="text-slate-900 w-5 h-5" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-white mb-2">
                {currentUser.name}
              </h1>
              <p className="text-blue-100/70 font-medium mb-4">
                {currentUser.email}
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="bg-yellow-400 text-slate-900 px-4 py-1 rounded-full font-bold text-sm shadow-lg">
                  {stats.rank} Rank
                </span>
                <span className="bg-orange-600 text-white px-4 py-1 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg">
                  <FaFire size={14} className="animate-pulse" /> {currentStreak}{" "}
                  Day Streak
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-bold transition-all border border-white/10 backdrop-blur-md"
          >
            <FaArrowLeft size={16} /> Dashboard
          </button>
        </header>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FaBookOpen}
            label="Quizzes"
            value={stats.quizzesTaken}
            color="text-blue-400"
          />
          <StatCard
            icon={FaBullseye}
            label="Avg Score"
            value={`${stats.averageScore}%`}
            color="text-purple-400"
          />
          <StatCard
            icon={FaBolt}
            label="Points"
            value={stats.totalPoints}
            color="text-yellow-400"
          />
          <StatCard
            icon={MdOutlineAssignmentTurnedIn}
            label="Correct"
            value={stats.correctAnswers}
            color="text-green-400"
          />
        </div>

        {/* TABS MENU */}
        <div className="w-full p-1.5 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/10 mb-8">
          <div className="flex w-full">
            {["overview", "achievements", "activity"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 rounded-xl text-sm sm:text-base font-bold transition-all capitalize ${
                  activeTab === tab
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="min-h-[400px]">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <FaBullseye className="text-blue-400" /> Performance
                </h3>
                <div className="space-y-6">
                  <ProgressItem
                    label="JavaScript"
                    percent={85}
                    gradient="from-yellow-400 to-orange-500"
                  />
                  <ProgressItem
                    label="React"
                    percent={72}
                    gradient="from-cyan-400 to-blue-500"
                  />
                  <ProgressItem
                    label="Python"
                    percent={45}
                    gradient="from-blue-400 to-indigo-600"
                  />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/20 flex flex-col items-center justify-center text-center">
                <FaTrophy
                  size={64}
                  className="text-yellow-400 mb-4 animate-bounce"
                />
                <h3 className="text-2xl font-bold text-white">
                  Latest Achievement
                </h3>
                <p className="text-blue-100/60 mt-2">
                  You're doing great! Keep up the consistency.
                </p>
              </div>
            </div>
          )}

          {activeTab === "achievements" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-8 rounded-[2rem] border transition-all ${
                    ach.earned
                      ? "bg-white/15 border-white/30 shadow-xl scale-100"
                      : "bg-white/5 border-white/5 opacity-40 grayscale"
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg bg-gradient-to-br ${ach.earned ? ach.gradient : "from-slate-700 to-slate-800"}`}
                  >
                    <ach.icon size={26} className="text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">
                    {ach.title}
                  </h4>
                  <p className="text-blue-100/60 text-sm mb-4">{ach.desc}</p>
                  {ach.earned ? (
                    <span className="text-xs font-black uppercase tracking-widest text-green-400 flex items-center gap-2">
                      <FaAward /> Unlocked
                    </span>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                      <FaLock size={12} /> Locked
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "activity" && (
            <div className="bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-8 py-4 text-blue-100/50 text-xs font-black uppercase">
                        Quiz
                      </th>
                      <th className="px-8 py-4 text-blue-100/50 text-xs font-black uppercase">
                        Date
                      </th>
                      <th className="px-8 py-4 text-blue-100/50 text-xs font-black uppercase">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {results.length > 0 ? (
                      results.map((r, i) => (
                        <tr
                          key={i}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3 text-white font-bold">
                              <FaBookOpen className="text-blue-400" size={14} />
                              {r.quizTitle}
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2 text-blue-100/60 text-sm">
                              <FaCalendarAlt size={12} />
                              {new Date(r.date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span
                              className={`px-3 py-1 rounded-lg font-bold text-sm ${r.percentage >= 70 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                            >
                              {r.percentage}%
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="3"
                          className="px-8 py-20 text-center text-blue-100/30 font-medium"
                        >
                          No activity recorded yet. Time to start a quiz!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 text-center hover:scale-105 transition-all group">
    <div className="flex justify-center mb-3">
      <Icon
        size={24}
        className={`${color} group-hover:scale-110 transition-transform`}
      />
    </div>
    <p className="text-3xl font-black text-white">{value}</p>
    <p className="text-blue-100/50 text-xs font-bold uppercase tracking-widest">
      {label}
    </p>
  </div>
);

const ProgressItem = ({ label, percent, gradient }) => (
  <div className="group">
    <div className="flex justify-between mb-2">
      <span className="text-white font-bold text-sm">{label}</span>
      <span className="text-blue-100/50 text-sm font-bold">{percent}%</span>
    </div>
    <div className="h-2.5 w-full bg-slate-900/50 rounded-full overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000`}
        style={{ width: `${percent}%` }}
      />
    </div>
  </div>
);

export default ProfilePage;
