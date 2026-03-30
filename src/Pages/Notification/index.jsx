import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaTrophy,
  FaFire,
  FaCode,
  FaCog,
  FaDatabase,
  FaServer,
  FaGlobe,
  FaTrash,
  FaCheckDouble,
  FaArrowLeft,
  FaCircle,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

// --- ANIMATED BACKGROUND COMPONENT (Consistent with Theme) ---
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
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

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  // Mock data for notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "achievement",
      title: "New Achievement Unlocked!",
      message: 'You earned the "Consistency King" badge for a 7-day streak.',
      time: "2 hours ago",
      isRead: false,
      icon: <FaTrophy className="text-yellow-400" />,
    },
    {
      id: 2,
      type: "streak",
      title: "Streak at Risk!",
      message: "Complete a quiz today to maintain your 5-day streak.",
      time: "5 hours ago",
      isRead: false,
      icon: <FaFire className="text-orange-500" />,
    },
    {
      id: 3,
      type: "system",
      title: "Platform Update",
      message: "New Python and Rust quizzes have been added to the dashboard.",
      time: "1 day ago",
      isRead: true,
      icon: <FaInfoCircle className="text-blue-400" />,
    },
    {
      id: 4,
      type: "achievement",
      title: "Level Up!",
      message: "Congratulations! You have reached Level 10.",
      time: "2 days ago",
      isRead: true,
      icon: <FaTrophy className="text-purple-400" />,
    },
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.isRead;
    return n.type === activeTab;
  });

  return (
    <main className="relative min-h-screen pb-20 bg-gradient-to-br from-blue-900 via-blue-600 to-indigo-900 overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-10">
        {/* Header Area */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/10 transition-all"
            >
              <FaArrowLeft size={18} />
            </button>
            <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
              Notifications <FaBell size={28} className="text-yellow-400" />
            </h1>
          </div>

          <button
            onClick={markAllRead}
            className="flex items-center gap-2 text-sm font-bold text-blue-200 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl border border-white/10"
          >
            <FaCheckDouble size={14} /> Mark all as read
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex p-1.5 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 mb-8 overflow-x-auto no-scrollbar">
          {["all", "unread", "achievement", "streak", "system"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                className={`group relative flex items-start gap-5 p-6 rounded-[2rem] border transition-all duration-300 ${
                  n.isRead
                    ? "bg-white/5 border-white/5 opacity-80"
                    : "bg-white/15 border-white/20 shadow-xl shadow-blue-900/20"
                }`}
              >
                {/* Status Indicator */}
                {!n.isRead && (
                  <div className="absolute top-6 right-6">
                    <FaCircle
                      className="text-blue-400 animate-pulse"
                      size={10}
                    />
                  </div>
                )}

                {/* Icon Box */}
                <div
                  className={`p-4 rounded-2xl bg-slate-900/50 border border-white/10 text-2xl`}
                >
                  {n.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3
                      className={`font-bold text-lg ${n.isRead ? "text-blue-100/70" : "text-white"}`}
                    >
                      {n.title}
                    </h3>
                  </div>
                  <p className="text-blue-100/60 text-sm leading-relaxed mb-3">
                    {n.message}
                  </p>
                  <span className="text-[10px] font-black uppercase tracking-tighter text-blue-300/40">
                    {n.time}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
                    title="Delete Notification"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <FaBell size={32} className="text-blue-100/20" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                You're all caught up!
              </h3>
              <p className="text-blue-100/40 text-sm">
                No new notifications to show right now.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default NotificationsPage;
