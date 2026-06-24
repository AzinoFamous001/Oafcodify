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
  PieChart,
  Pie,
  Legend,
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
  FaSearch,
} from "react-icons/fa";

const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-60">
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
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const currentUserId = sessionStorage.getItem("currentUserId");
    if (!currentUserId) {
      navigate("/login");
      return;
    }
    setUserId(currentUserId);

    const courses = ["HTML5", "CSS3", "JavaScript", "Python", "C++", "React"];

    // 1. Fetch real data from localStorage (user-specific storage)
    let userResults = [];
    
    try {
      const quizResultsKey = `quizResults_${currentUserId}`;
      userResults = JSON.parse(localStorage.getItem(quizResultsKey) || "[]");
      console.log('Performance page - User results loaded:', userResults.length, 'results for user:', currentUserId);
    } catch (error) {
      console.error('Error loading quiz results:', error);
      userResults = [];
    }

    // 2. Calculate Lesson Completion (Specific to your 6 courses)
    let totalCompletedLessons = 0;
    const lessonStats = {};

    courses.forEach((course) => {
      let courseCount = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // Checking for keys like: "userId_courseKey_lesson_lessonId_completed"
        if (
          key.startsWith(`${currentUserId}_${course}_lesson_`) &&
          key.includes("_completed")
        ) {
          courseCount++;
        }
      }
      lessonStats[course] = courseCount;
      totalCompletedLessons += courseCount;
    });

    // 3. Calculate Enhanced Quiz Statistics
    const calculateEnhancedStats = (results) => {
      console.log('calculateEnhancedStats called with', results.length, 'results');
      
      if (results.length === 0) {
        console.log('No quiz results found, returning default stats');
        return {
          avgAccuracy: 0,
          totalXP: totalCompletedLessons * 50, // Still show lesson XP
          quizzesCount: 0,
          bestScore: 0,
          worstScore: 0,
          improvement: 0,
          courseBreakdown: {},
          recentPerformance: [],
          totalCorrect: 0,
          totalQuestions: 0
        };
      }

      const scores = results.map(r => r.percentage);
      const avgAccuracy = Math.round(scores.reduce((sum, score) => sum + score, 0) / results.length);
      const bestScore = Math.max(...scores);
      const worstScore = Math.min(...scores);
      
      console.log('Calculated stats:', {
        avgAccuracy,
        quizzesCount: results.length,
        bestScore,
        worstScore
      });
      
      // Course breakdown
      const courseBreakdown = {};
      results.forEach(result => {
        if (!courseBreakdown[result.courseKey]) {
          courseBreakdown[result.courseKey] = {
            quizzes: 0,
            avgScore: 0,
            bestScore: 0,
            totalScore: 0,
            lessons: new Set()
          };
        }
        courseBreakdown[result.courseKey].quizzes++;
        courseBreakdown[result.courseKey].avgScore += result.percentage;
        courseBreakdown[result.courseKey].bestScore = Math.max(courseBreakdown[result.courseKey].bestScore, result.percentage);
        courseBreakdown[result.courseKey].totalScore += result.percentage;
        courseBreakdown[result.courseKey].lessons.add(result.lessonId);
      });
      
      // Calculate averages for each course
      Object.keys(courseBreakdown).forEach(course => {
        courseBreakdown[course].avgScore = Math.round(courseBreakdown[course].totalScore / courseBreakdown[course].quizzes);
      });

      // Recent performance (last 10 quizzes)
      const recentPerformance = results.slice(-10).map(r => ({
        date: new Date(r.date).toLocaleDateString(),
        score: r.percentage,
        quizTitle: r.quizTitle
      }));

      // Improvement calculation
      const firstHalf = results.slice(0, Math.floor(results.length / 2));
      const secondHalf = results.slice(Math.floor(results.length / 2));
      const firstAvg = firstHalf.length > 0 ? Math.round(firstHalf.reduce((sum, r) => sum + r.percentage, 0) / firstHalf.length) : 0;
      const secondAvg = secondHalf.length > 0 ? Math.round(secondHalf.reduce((sum, r) => sum + r.percentage, 0) / secondHalf.length) : 0;
      const improvement = secondAvg - firstAvg;

      const finalStats = {
        avgAccuracy,
        totalXP: results.length * 100 + totalCompletedLessons * 50,
        quizzesCount: results.length,
        bestScore,
        worstScore,
        improvement,
        courseBreakdown,
        recentPerformance,
        totalCorrect: results.reduce((sum, r) => sum + r.score, 0),
        totalQuestions: results.reduce((sum, r) => sum + r.totalQuestions, 0)
      };
      
      console.log('Final calculated stats:', finalStats);
      return finalStats;
    };

    const enhancedStats = calculateEnhancedStats(userResults);

    // 4. Radar Data Mapping
    // Grow radar based on quizzes taken AND lessons completed in that category
    const skillRadar = courses.map((course) => {
      const quizForCourse = userResults.filter((r) =>
        r.quizTitle?.toUpperCase().includes(course.toUpperCase()),
      );
      const quizWeight = quizForCourse.length * 20;
      const lessonWeight = (lessonStats[course] || 0) * 10;
      const totalWeight = quizWeight + lessonWeight;

      return {
        subject: course,
        A: totalWeight > 0 ? Math.min(totalWeight, 150) : 0, // Cap at fullMark, show 0 if no data
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

    // 6. Calculate Progress Pie Chart Data
    const totalPossibleLessons = courses.length * 5; // 6 courses * 5 lessons each
    const progressPieData = [
      { name: 'Completed', value: totalCompletedLessons || 0, color: '#22c55e' },
      { name: 'Remaining', value: Math.max(0, totalPossibleLessons - (totalCompletedLessons || 0)), color: '#3b82f6' }
    ];

    setUserStats({
      avgAccuracy: enhancedStats.avgAccuracy,
      totalXP: enhancedStats.totalXP,
      quizzesCount: enhancedStats.quizzesCount,
      bestScore: enhancedStats.bestScore,
      worstScore: enhancedStats.worstScore,
      improvement: enhancedStats.improvement,
      courseBreakdown: enhancedStats.courseBreakdown,
      recentPerformance: enhancedStats.recentPerformance,
      totalCorrect: enhancedStats.totalCorrect,
      totalQuestions: enhancedStats.totalQuestions,
      chartData: last7Days,
      skillRadar,
      progressPieData,
      totalCompletedLessons,
      totalPossibleLessons,
    });
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900">
        <AnimatedBackground />
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100/20 rounded-full mb-8">
              <FaChartLine className="text-blue-500 text-3xl animate-pulse" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-4">Loading Analytics</h1>
            <p className="text-lg text-blue-100/60 font-medium mb-8">
              Fetching your performance data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback content when no data is available
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900">
      <AnimatedBackground />
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100/20 rounded-full mb-8">
              <FaChartLine className="text-blue-500 text-3xl" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-4">No Performance Data</h1>
            <p className="text-lg text-blue-100/60 font-medium mb-8">
              You haven't taken any quizzes yet. Start learning to see your progress here!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <FaChartLine className="text-xl" />
                <span>Go to Dashboard</span>
              </button>
              <button
                onClick={() => navigate('/lessons')}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <FaSearch className="text-xl" />
                <span>Browse Lessons</span>
              </button>
            </div>
          </div>
        </div>
      </div>
  );

  return (
    userStats.quizzesCount === 0 ? (
      <EmptyState />
    ) : (
      <main className="relative min-h-screen pb-20 bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 overflow-x-hidden text-white">
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

        {/* Enhanced Quiz Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Quiz Performance Overview */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FaChartLine className="text-blue-400" /> Quiz Performance Overview
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <h4 className="text-lg font-bold text-white mb-4">Quiz Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-black text-green-400 mb-1">{userStats.quizzesCount}</div>
                    <div className="text-sm text-blue-100/60">Total Quizzes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-blue-400 mb-1">{userStats.avgAccuracy}%</div>
                    <div className="text-sm text-blue-100/60">Average Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-yellow-400 mb-1">{userStats.bestScore}%</div>
                    <div className="text-sm text-blue-100/60">Best Score</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-black mb-1 ${userStats.improvement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {userStats.improvement >= 0 ? '+' : ''}{userStats.improvement}%
                    </div>
                    <div className="text-sm text-blue-100/60">Improvement</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Performance */}
            {userStats.recentPerformance && userStats.recentPerformance.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-bold text-white mb-3">Recent Quiz Performance</h4>
                <div className="space-y-2">
                  {userStats.recentPerformance.slice(0, 5).map((perf, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex-1">
                        <div className="text-sm text-white font-medium">{perf.quizTitle}</div>
                        <div className="text-xs text-blue-100/60">{perf.date}</div>
                      </div>
                      <div className="text-lg font-bold text-white">{perf.score}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Breakdown */}
            {userStats.courseBreakdown && Object.keys(userStats.courseBreakdown).length > 0 && (
              <div>
                <h4 className="text-lg font-bold text-white mb-3">Course Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(userStats.courseBreakdown).map(([course, data]) => (
                    <div key={course} className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-bold text-white">{course}</h5>
                        <span className="text-sm text-blue-100/60">{data.lessons.size} lessons</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-100/60">Quizzes:</span>
                          <span className="text-white font-medium">{data.quizzes}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-100/60">Average:</span>
                          <span className="text-white font-medium">{data.avgScore}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-100/60">Best:</span>
                          <span className="text-green-400 font-medium">{data.bestScore}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
       {/* Quick Stats */}
       <div className="flex flex-wrap justify-center lg:justify-between gap-4 sm:gap-6">
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

          {/* Radar for 6 specific courses */}
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

          {/* Progress Pie Chart */}
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl">
            <h3 className="text-xl font-bold mb-8">Overall Progress</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userStats.progressPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userStats.progressPieData && userStats.progressPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "none",
                      borderRadius: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <p className="text-blue-100/60 text-sm">
                {userStats.totalCompletedLessons || 0} of {userStats.totalPossibleLessons} lessons completed
              </p>
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
    )
  );
};

const SummaryCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white/10 backdrop-blur-md p-4 sm:p-6 w-full sm:w-[180px]  rounded-[2rem] border border-white/20 transition-all flex-shrink-0">
    <div className="flex items-center gap-3 sm:gap-4">
      <div className={`p-3 rounded-xl bg-slate-900/50 ${color}`}>
        <Icon size={20} />
      </div>

      <div>
        <p className="text-xl sm:text-2xl font-black">{value}</p>

        <p className="text-blue-100/40 text-[10px] font-bold uppercase tracking-widest">
          {label}
        </p>
      </div>
    </div>
  </div>
);

export default PerformancePage;
