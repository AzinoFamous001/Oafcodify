import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTrophy,
  FaAward,
  FaBookOpen,
  FaMedal,
  FaBolt,
  FaFire,
  FaLock,
  FaArrowLeft,
  FaCode,
  FaDatabase,
  FaBullseye,
  FaCheckDouble,
} from "react-icons/fa";
import { MdOutlineAssignmentTurnedIn } from "react-icons/md";

const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-60">
    <div className="absolute top-[10%] left-[5%] animate-[spin_20s_linear_infinite] hidden sm:block">
      <FaCode size={120} className="text-white/30" />
    </div>
    <div className="absolute bottom-[15%] left-[10%] animate-bounce duration-[5000ms]">
      <FaDatabase size={60} className="text-white/20" />
    </div>
  </div>
);

const ProfilePage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [results, setResults] = useState([]);
  const [completedLessonsCount, setCompletedLessonsCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  const navigate = useNavigate();

  // --- REFINED DAILY STREAK LOGIC ---
  const updateLoginStreak = useCallback((userId) => {
    const streakKey = `streak_${userId}`;
    const lastLoginKey = `lastLogin_${userId}`;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize time to midnight
    const todayStr = today.toISOString().split("T")[0];

    const lastLoginStr = localStorage.getItem(lastLoginKey);
    let streak = parseInt(localStorage.getItem(streakKey) || "0");

    // Case 1: First time login ever
    if (!lastLoginStr) {
      streak = 1;
    } else {
      const lastLoginDate = new Date(lastLoginStr);
      lastLoginDate.setHours(0, 0, 0, 0);

      // Calculate difference in days
      const diffTime = today - lastLoginDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Case 2: Consecutive day login
        streak += 1;
      } else if (diffDays > 1) {
        // Case 3: Missed a day - Reset
        streak = 1;
      }
      // Case 4: diffDays === 0 (Same day login) -> Streak remains unchanged
    }

    // Save back to storage
    localStorage.setItem(lastLoginKey, todayStr);
    localStorage.setItem(streakKey, streak.toString());
    return streak;
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("currentUserId");
    if (!userId) {
      navigate("/login");
      return;
    }

    setCurrentUser({
      name: localStorage.getItem("userName") || "Developer",
      email: localStorage.getItem("userEmail") || "dev@codebay.com",
    });

    // Quiz Results - Fresh for new user
    const savedResults = localStorage.getItem("quizResults");
    const allResults = savedResults ? JSON.parse(savedResults) : [];
    const userSpecificResults = allResults.filter((r) => r.userId === userId);
    setResults(
      userSpecificResults.sort((a, b) => new Date(b.date) - new Date(a.date)),
    );

    // Lessons - Fresh for new user
    let lessonCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(`${userId}_lesson_`) && key.includes("_completed")) {
        const data = JSON.parse(localStorage.getItem(key));
        if (Array.isArray(data) && data.length > 0) lessonCount++;
      }
    }
    setCompletedLessonsCount(lessonCount);

    // Calculate Streak
    setCurrentStreak(updateLoginStreak(userId));
  }, [navigate, updateLoginStreak]);

  const hasQuizzes = results.length > 0;
  const stats = {
    quizzesTaken: results.length || 0,
    lessonsCompleted: completedLessonsCount || 0,
    avgScore: hasQuizzes
      ? Math.round(
          results.reduce((sum, r) => sum + r.percentage, 0) / results.length,
        )
      : 0,
    points: hasQuizzes ? results.reduce((sum, r) => sum + r.score * 10, 0) : 0,
    correct: hasQuizzes ? results.reduce((sum, r) => sum + r.score, 0) : 0,
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
      desc: "Complete 1 quiz",
      icon: FaTrophy,
      earned: stats.quizzesTaken >= 1,
      gradient: "from-yellow-400 to-orange-500",
    },
    {
      id: 2,
      title: "Perfect Score",
      desc: "Get 100% on a quiz",
      icon: FaAward,
      earned: results.some((r) => r.percentage === 100),
      gradient: "from-blue-400 to-indigo-600",
    },
    {
      id: 3,
      title: "Fire Starter",
      desc: "3 Day login streak",
      icon: FaFire,
      earned: currentStreak >= 3,
      gradient: "from-red-500 to-orange-600",
    },
    {
      id: 4,
      title: "Scholar",
      desc: "Complete 5 lessons",
      icon: FaCheckDouble,
      earned: stats.lessonsCompleted >= 5,
      gradient: "from-green-500 to-teal-500",
    },
  ];

  if (!currentUser) return null;

  return (
    <main className="relative min-h-screen pb-24 bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 overflow-x-hidden">
      <AnimatedBackground />
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-10">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-2xl">
                <img
                  src="/Logo_.jpg"
                  alt="User"
                  className="w-full h-full object-cover"
                  onError={(e) =>
                    (e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=0D8ABC&color=fff`)
                  }
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 p-2 rounded-full border-2 border-blue-900 shadow-lg">
                <FaMedal className="text-blue-900 w-4 h-4" />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-extrabold text-white mb-2">
                {currentUser.name}
              </h1>
              <p className="text-blue-100/70 font-medium mb-4">
                {currentUser.email}
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="bg-yellow-400 text-blue-900 px-4 py-1 rounded-full font-bold text-sm shadow-lg">
                  {stats.rank} Rank
                </span>
                <span className="bg-orange-600 text-white px-4 py-1 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg">
                  <FaFire
                    className={currentStreak > 0 ? "animate-pulse" : ""}
                  />{" "}
                  {currentStreak} Day Streak
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-bold transition-all border border-white/10"
          >
            <FaArrowLeft /> Dashboard
          </button>
        </header>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={FaBookOpen}
            label="Quizzes"
            value={stats.quizzesTaken}
            color="text-blue-400"
          />
          <StatCard
            icon={FaCheckDouble}
            label="Lessons"
            value={stats.lessonsCompleted}
            color="text-green-400"
          />
          <StatCard
            icon={FaBullseye}
            label="Avg Score"
            value={`${stats.avgScore}%`}
            color="text-purple-400"
          />
          <StatCard
            icon={FaBolt}
            label="Points"
            value={stats.points}
            color="text-yellow-400"
          />
          <StatCard
            icon={MdOutlineAssignmentTurnedIn}
            label="Correct"
            value={stats.correct}
            color="text-teal-400"
          />
        </div>

        {/* TABS & CONTENT */}
        <div className="w-full p-1.5 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/10 mb-8">
          <div className="flex w-full">
            {["overview", "achievements", "activity"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all capitalize ${
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

        <div className="min-h-[300px]">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <FaBullseye className="text-blue-400" /> Progress Tracker
                </h3>
                <div className="space-y-6">
                  <ProgressItem
                    label="Overall Quiz Score"
                    percent={stats.avgScore}
                    gradient="from-purple-400 to-blue-500"
                  />
                  <ProgressItem
                    label="Lesson Engagement"
                    percent={Math.min(stats.lessonsCompleted * 10, 100)}
                    gradient="from-green-400 to-teal-500"
                  />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/20 flex flex-col items-center justify-center text-center">
                {!hasQuizzes ? (
                  <div className="opacity-40">
                    <FaLock size={48} className="text-white mb-4 mx-auto" />
                    <h3 className="text-xl font-bold text-white">
                      Stats Locked
                    </h3>
                    <p className="text-blue-100/60 mt-2">
                      Take your first quiz to unlock analysis!
                    </p>
                  </div>
                ) : (
                  <div>
                    <FaTrophy
                      size={64}
                      className="text-yellow-400 mb-4 animate-bounce mx-auto"
                    />
                    <h3 className="text-2xl font-bold text-white">
                      Progressing Well!
                    </h3>
                    <p className="text-blue-100/60 mt-2">
                      You have accumulated {stats.points} total points.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "achievements" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-6 rounded-[2rem] border transition-all ${ach.earned ? "bg-white/15 border-white/30" : "bg-white/5 border-white/5 opacity-30 grayscale"}`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${ach.earned ? ach.gradient : "from-slate-700 to-slate-800"}`}
                  >
                    <ach.icon size={20} className="text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-1">
                    {ach.title}
                  </h4>
                  <p className="text-blue-100/60 text-xs">{ach.desc}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "activity" && (
            <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/20 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/10 text-blue-100/50 uppercase text-xs">
                  <tr>
                    <th className="px-8 py-4">Activity Name</th>
                    <th className="px-8 py-4">Completed Date</th>
                    <th className="px-8 py-4 text-right">Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {hasQuizzes ? (
                    results.map((r, i) => (
                      <tr
                        key={i}
                        className="text-white hover:bg-white/5 transition-colors"
                      >
                        <td className="px-8 py-5 font-bold">{r.quizTitle}</td>
                        <td className="px-8 py-5 text-blue-100/60">
                          {new Date(r.date).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span
                            className={`px-3 py-1 rounded-lg text-sm font-bold ${r.percentage >= 70 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
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
                        className="px-8 py-20 text-center text-blue-100/30"
                      >
                        No quiz records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/10 text-center transition-all hover:bg-white/20">
    <div className="flex justify-center mb-2">
      <Icon size={18} className={color} />
    </div>
    <p className="text-2xl font-black text-white">{value}</p>
    <p className="text-[10px] font-bold text-blue-100/40 uppercase tracking-tighter">
      {label}
    </p>
  </div>
);

const ProgressItem = ({ label, percent, gradient }) => (
  <div>
    <div className="flex justify-between mb-1 text-xs font-bold">
      <span className="text-white/80">{label}</span>
      <span className="text-blue-100/40">{percent}%</span>
    </div>
    <div className="h-1.5 w-full bg-slate-900/50 rounded-full overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r ${gradient} transition-all duration-1000`}
        style={{ width: `${percent}%` }}
      />
    </div>
  </div>
);

export default ProfilePage;
