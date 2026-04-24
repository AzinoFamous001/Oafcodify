import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";
import {
  FaChartLine,
  FaArrowLeft,
  FaCode,
  FaCog,
  FaDatabase,
  FaFire,
  FaBullseye,
  FaHistory,
  FaLightbulb,
  FaCrown,
} from "react-icons/fa";

const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
    <div className="absolute top-[10%] left-[5%] animate-[spin_20s_linear_infinite]">
      <FaCode size={120} className="text-white/20" />
    </div>
    <div className="absolute bottom-[15%] left-[15%] animate-bounce duration-[5000ms]">
      <FaDatabase size={80} className="text-white/10" />
    </div>
  </div>
);

const PerformancePage = () => {
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState({
    avgAccuracy: 0,
    totalXP: 0,
    quizzesCount: 0,
    chartData: [],
    skillRadar: [],
  });

  useEffect(() => {
    const userId = localStorage.getItem("currentUserId");
    if (!userId) {
      navigate("/login");
      return;
    }

    const courses = ["HTML", "CSS", "C++", "React", "Python", "JavaScript"];

    // 1. Fetch real data from localStorage
    const savedResults = JSON.parse(
      localStorage.getItem("quizResults") || "[]",
    );
    const userResults = savedResults.filter((r) => r.userId === userId);

    // 2. Calculate Lesson Completion (Specific to your 6 courses)
    let totalCompletedLessons = 0;
    const lessonStats = {};

    courses.forEach((course) => {
      let courseCount = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // Checking for keys like: "userId_lesson_HTML_1_completed"
        if (
          key.startsWith(`${userId}_lesson_${course}`) &&
          key.includes("_completed")
        ) {
          courseCount++;
        }
      }
      lessonStats[course] = courseCount;
      totalCompletedLessons += courseCount;
    });

    // 3. Calculate Stats
    const totalQuizScore = userResults.reduce(
      (sum, r) => sum + r.percentage,
      0,
    );
    const avgAccuracy =
      userResults.length > 0
        ? Math.round(totalQuizScore / userResults.length)
        : 0;

    // XP Logic: 100 per Quiz, 50 per Lesson
    const totalXP = userResults.length * 100 + totalCompletedLessons * 50;

    // 4. Radar Data Mapping
    // Grow radar based on quizzes taken AND lessons completed in that category
    const skillRadar = courses.map((course) => {
      const quizForCourse = userResults.filter((r) =>
        r.quizTitle?.toUpperCase().includes(course.toUpperCase()),
      );
      const quizWeight = quizForCourse.length * 20;
      const lessonWeight = (lessonStats[course] || 0) * 10;

      return {
        subject: course,
        A: Math.min(quizWeight + lessonWeight, 150), // Cap at fullMark
        fullMark: 150,
      };
    });

    // 5. Chart Data (Last 7 Days)
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const last7Days = [...Array(7)]
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = days[d.getDay()];
        const dateStr = d.toISOString().split("T")[0];

        const dayResults = userResults.filter(
          (r) => r.date.split("T")[0] === dateStr,
        );
        const dayScore =
          dayResults.length > 0
            ? Math.round(
                dayResults.reduce((s, r) => s + r.percentage, 0) /
                  dayResults.length,
              )
            : 0;

        return {
          name: dayName,
          score: dayScore,
          xp: dayResults.length * 100,
        };
      })
      .reverse();

    setUserStats({
      avgAccuracy,
      totalXP,
      quizzesCount: userResults.length,
      chartData: last7Days,
      skillRadar,
    });
  }, [navigate]);

  return (
    <main className="relative min-h-screen pb-20 bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 overflow-hidden text-white">
      <AnimatedBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-10">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate(-1)}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all"
            >
              <FaArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-4xl font-black tracking-tight">Analytics</h1>
              <p className="text-blue-100/60 font-medium">
                Curriculum Progress (6 Courses)
              </p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
            <FaCrown className="text-yellow-400" />
            <span className="font-bold">
              LVL {Math.floor(userStats.totalXP / 500) + 1}
            </span>
          </div>
        </header>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            icon={FaFire}
            label="Accuracy"
            value={`${userStats.avgAccuracy}%`}
            color="text-orange-400"
          />
          <SummaryCard
            icon={FaBullseye}
            label="Total XP"
            value={userStats.totalXP}
            color="text-blue-400"
          />
          <SummaryCard
            icon={FaHistory}
            label="Quizzes"
            value={userStats.quizzesCount}
            color="text-green-400"
          />
          <SummaryCard
            icon={FaLightbulb}
            label="Course Rank"
            value="Junior"
            color="text-purple-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Growth Chart */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-8">
              <FaChartLine className="text-blue-400" /> Performance Trend
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userStats.chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.4)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.4)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "none",
                      borderRadius: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#60a5fa"
                    strokeWidth={4}
                    fill="url(#colorScore)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar for the 6 specific courses */}
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl">
            <h3 className="text-xl font-bold mb-8">Skill Mastery</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  data={userStats.skillRadar}
                >
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }}
                  />
                  <Radar
                    name="Proficiency"
                    dataKey="A"
                    stroke="#818cf8"
                    fill="#818cf8"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* XP Bar Chart */}
          <div className="lg:col-span-3 bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl">
            <h3 className="text-xl font-bold mb-8">Daily XP Gains</h3>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userStats.chartData}>
                  <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.4)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    contentStyle={{ display: "none" }}
                  />
                  <Bar dataKey="xp" radius={[10, 10, 0, 0]}>
                    {userStats.chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.xp > 0 ? "#fbbf24" : "#3b82f6"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

const SummaryCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 transition-all">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-slate-900/50 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-black">{value}</p>
        <p className="text-blue-100/40 text-[10px] font-bold uppercase tracking-widest">
          {label}
        </p>
      </div>
    </div>
  </div>
);

export default PerformancePage;
