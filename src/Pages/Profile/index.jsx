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
import { updateLoginStreak, getCurrentStreak, checkDailyLessonReminder } from "../../Shared/streakUtils";

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
  const [cartoonAvatar, setCartoonAvatar] = useState("");
  const [userId, setUserId] = useState(null);

  const navigate = useNavigate();

  // Generate cartoon avatar (deterministic based on username)
  const generateCartoonAvatar = (userName) => {
    const avatarStyles = [
      'adventurer', 'adventurer-neutral', 'avataaars', 'bottts', 
      'fun-emoji', 'lorelei', 'micah', 'notionists', 'open-peeps', 'personas'
    ];
    // Use a simple hash of the username to always select the same style for the same user
    let hash = 0;
    for (let i = 0; i < userName.length; i++) {
      hash = userName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const styleIndex = Math.abs(hash) % avatarStyles.length;
    const randomStyle = avatarStyles[styleIndex];
    const seed = userName || Math.random().toString(36).substring(7);
    return `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${seed}`;
  };


  useEffect(() => {
    const currentUserId = sessionStorage.getItem("currentUserId");
    console.log('Profile - currentUserId:', currentUserId);
    if (!currentUserId) {
      navigate("/login");
      return;
    }
    setUserId(currentUserId);


    const userName = localStorage.getItem(`userName_${currentUserId}`) || "Developer";
    setCurrentUser({
      name: userName,
      email: localStorage.getItem(`userEmail_${currentUserId}`) || "dev@oafcodify.com",
    });

    // Generate or retrieve cartoon avatar (user-specific storage)
    const avatarKey = `userAvatar_${currentUserId}`;
    const savedAvatar = localStorage.getItem(avatarKey);
    if (savedAvatar && savedAvatar.startsWith("https://api.dicebear.com")) {
      setCartoonAvatar(savedAvatar);
    } else {
      const newAvatar = generateCartoonAvatar(userName);
      setCartoonAvatar(newAvatar);
      localStorage.setItem(avatarKey, newAvatar);
    }

    // Quiz Results - User-specific storage
    const quizResultsKey = `quizResults_${currentUserId}`;
    const savedResults = localStorage.getItem(quizResultsKey);
    const userSpecificResults = savedResults ? JSON.parse(savedResults) : [];
    setResults(
      userSpecificResults.sort((a, b) => new Date(b.date) - new Date(a.date)),
    );

    // Lessons - Fresh for new user
    let lessonCount = 0;
    const courses = ["HTML5", "CSS3", "JavaScript", "Python", "C++", "React"];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Check for keys like: "userId_courseKey_lesson_lessonId_completed"
      const courseMatch = courses.find(course => key.startsWith(`${currentUserId}_${course}_lesson_`));
      if (courseMatch && key.includes("_completed")) {
        const data = JSON.parse(localStorage.getItem(key));
        if (Array.isArray(data) && data.length > 0) lessonCount++;
      }
    }
    setCompletedLessonsCount(lessonCount);

    // Calculate completed courses (all 5 lessons in a course)
    let completedCoursesCount = 0;
    courses.forEach(course => {
      let completedInCourse = 0;
      for (let lessonId = 1; lessonId <= 5; lessonId++) {
        const lessonKey = `${currentUserId}_${course}_lesson_${lessonId}_completed`;
        if (localStorage.getItem(lessonKey)) {
          completedInCourse++;
        }
      }
      if (completedInCourse === 5) {
        completedCoursesCount++;
      }
    });
    localStorage.setItem(`completedCourses_${currentUserId}`, completedCoursesCount.toString());

    // Update streak on profile visit
    const updatedStreak = updateLoginStreak(currentUserId);
    setCurrentStreak(updatedStreak);
    
    // Check for daily lesson reminder
    checkDailyLessonReminder(currentUserId);

    // Sync progress to backend
    syncProgressToBackend(currentUserId);

    // Auto-scroll to top on page mount
    window.scrollTo(0, 0);
  }, [navigate, userId]);

  const hasQuizzes = results.length > 0;
  
  // Calculate detailed quiz statistics
  const calculateQuizStats = () => {
    if (!hasQuizzes) {
      return {
        totalQuizzes: 0,
        avgScore: 0,
        bestScore: 0,
        worstScore: 0,
        recentScores: [],
        courseProgress: {},
        totalPoints: 0,
        improvement: 0
      };
    }

    const scores = results.map(r => r.percentage);
    const totalQuizzes = results.length;
    const avgScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / totalQuizzes);
    const bestScore = Math.max(...scores);
    const worstScore = Math.min(...scores);
    const recentScores = results.slice(-5).map(r => r.percentage).reverse();
    
    // Calculate course progress
    const courseProgress = {};
    results.forEach(result => {
      if (!courseProgress[result.courseKey]) {
        courseProgress[result.courseKey] = {
          quizzes: 0,
          avgScore: 0,
          bestScore: 0,
          lessons: new Set()
        };
      }
      courseProgress[result.courseKey].quizzes++;
      courseProgress[result.courseKey].avgScore += result.percentage;
      courseProgress[result.courseKey].bestScore = Math.max(courseProgress[result.courseKey].bestScore, result.percentage);
      courseProgress[result.courseKey].lessons.add(result.lessonId);
    });
    
    // Calculate averages for each course
    Object.keys(courseProgress).forEach(course => {
      courseProgress[course].avgScore = Math.round(courseProgress[course].avgScore / courseProgress[course].quizzes);
    });

    // Calculate improvement (compare first 3 quizzes with last 3 quizzes)
    const firstThree = results.slice(0, 3).map(r => r.percentage);
    const lastThree = results.slice(-3).map(r => r.percentage);
    const firstAvg = firstThree.length > 0 ? Math.round(firstThree.reduce((sum, score) => sum + score, 0) / firstThree.length) : 0;
    const lastAvg = lastThree.length > 0 ? Math.round(lastThree.reduce((sum, score) => sum + score, 0) / lastThree.length) : 0;
    const improvement = lastAvg - firstAvg;

    return {
      totalQuizzes,
      avgScore,
      bestScore,
      worstScore,
      recentScores,
      courseProgress,
      totalPoints: results.reduce((sum, r) => sum + r.score * 10, 0),
      improvement
    };
  };

  const quizStats = calculateQuizStats();

  const completedCoursesCount = parseInt(localStorage.getItem(`completedCourses_${userId}`) || '0');

  const stats = {
    quizzesTaken: results.length || 0,
    lessonsCompleted: completedLessonsCount || 0,
    avgScore: quizStats.avgScore,
    points: quizStats.totalPoints,
    correct: hasQuizzes ? results.reduce((sum, r) => sum + r.score, 0) : 0,
    rank:
      completedCoursesCount >= 2
        ? "Gold"
        : completedCoursesCount >= 1
          ? "Silver"
          : "Bronze",
  };

  // Helper function to add notification
  const addNotification = (notification, userId) => {
    if (!userId) return;
    const storageKey = `notifications_${userId}`;
    const savedNotifications = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    // Check if notification already exists to avoid duplicates
    const exists = savedNotifications.some(n => 
      n.type === notification.type && 
      n.title === notification.title &&
      n.message === notification.message
    );
    
    if (!exists) {
      savedNotifications.unshift(notification);
      localStorage.setItem(storageKey, JSON.stringify(savedNotifications));
      
      // Sync notification to backend
      const numericUserId = parseInt(userId);
      if (!isNaN(numericUserId)) {
        fetch(`/api/user/notification/${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notification })
        })
        .then(response => {
          if (!response.ok) throw new Error(`Backend returned ${response.status}`);
          return response.json();
        })
        .catch(err => console.error('Error syncing notification to backend:', err));
      }
    }
  };

  // Helper function to sync progress to backend
  const syncProgressToBackend = (userId) => {
    if (!userId) return;
    
    // Collect all progress data from localStorage
    const quizResults = JSON.parse(localStorage.getItem(`quizResults_${userId}`) || '[]');
    const streak = {
      current: parseInt(localStorage.getItem(`streak_${userId}`) || '0'),
      lastLogin: localStorage.getItem(`lastLogin_${userId}`)
    };
    const notifications = JSON.parse(localStorage.getItem(`notifications_${userId}`) || '[]');
    const completedCourses = parseInt(localStorage.getItem(`completedCourses_${userId}`) || '0');
    
    // Collect lesson progress
    const lessonProgress = {};
    const courses = ["HTML5", "CSS3", "JavaScript", "Python", "C++", "React"];
    courses.forEach(course => {
      for (let lessonId = 1; lessonId <= 5; lessonId++) {
        const completedKey = `${userId}_${course}_lesson_${lessonId}_completed`;
        const unlockedKey = `${userId}_${course}_lesson_${lessonId}_unlocked`;
        const key = `${course}_lesson_${lessonId}`;
        
        if (localStorage.getItem(completedKey)) {
          lessonProgress[key] = { completed: true };
        }
        if (localStorage.getItem(unlockedKey)) {
          if (!lessonProgress[key]) lessonProgress[key] = {};
          lessonProgress[key].unlocked = true;
        }
      }
    });
    
    // Send progress to backend
    fetch(`/api/user/progress/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quizResults,
        lessonProgress,
        streak,
        notifications,
        completedCourses
      })
    }).catch(err => console.error('Error syncing progress to backend:', err));
  };

  // Check for newly earned achievements and send notifications
  // useEffect(() => {
  //   if (!userId) return;

  //   const earnedAchievements = [];
    
  //   if (stats.quizzesTaken >= 1) {
  //     earnedAchievements.push({
  //       id: 1,
  //       title: "First Quiz",
  //       desc: "Complete 1 quiz",
  //       icon: FaTrophy,
  //       gradient: "from-yellow-400 to-orange-500",
  //     });
  //   }
    
  //   if (results.some((r) => r.percentage === 100)) {
  //     earnedAchievements.push({
  //       id: 2,
  //       title: "Perfect Score",
  //       desc: "Get 100% on a quiz",
  //       icon: FaAward,
  //       gradient: "from-blue-400 to-indigo-600",
  //     });
  //   }
    
  //   if (currentStreak >= 3) {
  //     earnedAchievements.push({
  //       id: 3,
  //       title: "Fire Starter",
  //       desc: "3 Day login streak",
  //       icon: FaFire,
  //       gradient: "from-red-500 to-orange-600",
  //     });
  //   }
    
  //   if (stats.lessonsCompleted >= 5) {
  //     earnedAchievements.push({
  //       id: 4,
  //       title: "Scholar",
  //       desc: "Complete 5 lessons",
  //       icon: FaCheckDouble,
  //       gradient: "from-green-500 to-teal-500",
  //     });
  //   }

  //   // Get previously earned achievements
  //   const earnedKey = `earnedAchievements_${userId}`;
  //   const previouslyEarned = JSON.parse(localStorage.getItem(earnedKey) || '[]');
    
  //   // Find newly earned achievements
  //   const newlyEarned = earnedAchievements.filter(ach => 
  //     !previouslyEarned.includes(ach.id)
  //   );

  //   // Send notifications for newly earned achievements
  //   newlyEarned.forEach(ach => {
  //     addNotification({
  //       id: Date.now() + ach.id,
  //       type: 'achievement',
  //       title: `🏆 Achievement Unlocked: ${ach.title}!`,
  //       message: `Congratulations! You've earned the "${ach.title}" achievement: ${ach.desc}`,
  //       time: 'Just now',
  //       isRead: false,
  //       iconType: 'achievement'
  //     }, userId);
  //   });

  //   // Update earned achievements list
  //   const allEarnedIds = earnedAchievements.map(ach => ach.id);
  //   localStorage.setItem(earnedKey, JSON.stringify(allEarnedIds));
  // }, [userId, stats.quizzesTaken, results, currentStreak, stats.lessonsCompleted]);

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
              <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-2xl bg-white">
                <img
                  src={cartoonAvatar}
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
            <div className="space-y-8">
              {/* Detailed Quiz Statistics */}
              {hasQuizzes && (
                <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/20">
                  <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                    <FaTrophy className="text-yellow-400" /> Quiz Performance
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
                      <div className="text-3xl font-black text-yellow-400 mb-2">{quizStats.totalQuizzes}</div>
                      <div className="text-sm text-blue-100/60">Total Quizzes</div>
                    </div>
                    <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
                      <div className="text-3xl font-black text-green-400 mb-2">{quizStats.avgScore}%</div>
                      <div className="text-sm text-blue-100/60">Average Score</div>
                    </div>
                    <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
                      <div className="text-3xl font-black text-blue-400 mb-2">{quizStats.bestScore}%</div>
                      <div className="text-sm text-blue-100/60">Best Score</div>
                    </div>
                    <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
                      <div className={`text-3xl font-black mb-2 ${quizStats.improvement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {quizStats.improvement >= 0 ? '+' : ''}{quizStats.improvement}%
                      </div>
                      <div className="text-sm text-blue-100/60">Improvement</div>
                    </div>
                  </div>

                  {/* Recent Scores */}
                  <div className="mb-8">
                    <h4 className="text-xl font-bold text-white mb-4">Recent Scores</h4>
                    <div className="flex gap-3">
                      {quizStats.recentScores.map((score, index) => (
                        <div key={index} className="flex-1 text-center p-3 bg-white/5 rounded-xl border border-white/10">
                          <div className="text-lg font-bold text-white">{score}%</div>
                          <div className="text-xs text-blue-100/60">Quiz {quizStats.totalQuizzes - index}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Course Progress */}
                  {Object.keys(quizStats.courseProgress).length > 0 && (
                    <div>
                      <h4 className="text-xl font-bold text-white mb-4">Course Progress</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(quizStats.courseProgress).map(([course, data]) => (
                          <div key={course} className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <div className="flex justify-between items-center mb-2">
                              <h5 className="font-bold text-white">{course}</h5>
                              <span className="text-sm text-blue-100/60">{data.lessons.size} lessons</span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-blue-100/60">Quizzes:</span>
                                <span className="text-white font-bold">{data.quizzes}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-blue-100/60">Average:</span>
                                <span className="text-white font-bold">{data.avgScore}%</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-blue-100/60">Best:</span>
                                <span className="text-green-400 font-bold">{data.bestScore}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

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
