import React, { useState, useEffect } from "react";
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
  FaRedo,
} from "react-icons/fa";

// --- ANIMATED BACKGROUND ---
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

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);

  // --- LOAD USER SPECIFIC NOTIFICATIONS ---
  useEffect(() => {
    const currentId = sessionStorage.getItem("currentUserId");
    if (!currentId) {
      navigate("/login");
      return;
    }
    setUserId(currentId);

    const storageKey = `notifications_${currentId}`;
    const savedNotifications = localStorage.getItem(storageKey);

    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
      // DEFAULT NOTIFICATIONS FOR NEW USER
      const welcomeNotifications = [
        {
          id: Date.now(),
          type: "system",
          title: "Welcome to Oafcodify!",
          message:
            "Start your journey by completing your first lesson in HTML or JavaScript.",
          time: "Just now",
          isRead: false,
          iconType: "info",
        },
      ];
      setNotifications(welcomeNotifications);
      localStorage.setItem(storageKey, JSON.stringify(welcomeNotifications));

      // Sync welcome notification to backend
      const numericUserId = parseInt(currentId);
      if (!isNaN(numericUserId)) {
        fetch(`/api/user/notification/${currentId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notification: welcomeNotifications[0] })
        })
        .then(response => {
          if (!response.ok) throw new Error(`Backend returned ${response.status}`);
          return response.json();
        })
        .catch(err => console.error('Error syncing welcome notification to backend:', err));
      }
    }
  }, [navigate]);

  // --- SAVE CHANGES HELPER ---
  const saveToStorage = (updatedList) => {
    setNotifications(updatedList);
    localStorage.setItem(
      `notifications_${userId}`,
      JSON.stringify(updatedList),
    );
  };

  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    saveToStorage(updated);
  };

  const deleteNotification = (id) => {
    const updated = notifications.filter((n) => n.id !== id);
    saveToStorage(updated);
  };

  const getIcon = (type) => {
    switch (type) {
      case "achievement":
        return <FaTrophy className="text-yellow-400" />;
      case "streak":
        return <FaFire className="text-orange-500" />;
      case "system":
        return <FaInfoCircle className="text-blue-400" />;
      case "recommendation":
        return <FaRedo className="text-purple-400" />;
      default:
        return <FaBell className="text-blue-400" />;
    }
  };

  const handleNotificationClick = (n) => {
    // Mark as read
    const updated = notifications.map((notif) => 
      notif.id === n.id ? { ...notif, isRead: true } : notif
    );
    saveToStorage(updated);

    // Navigate to quiz if it's a recommendation
    if (n.type === 'recommendation' && n.lessonId && n.courseKey) {
      navigate(`/quiz/${n.courseKey}/${n.lessonId}`);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.isRead;
    return n.type === activeTab;
  });

  return (
    <main className="relative min-h-screen pb-20 bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/10 transition-all"
            >
              <FaArrowLeft size={18} />
            </button>
            <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
              Inbox <FaBell size={28} className="text-yellow-400" />
            </h1>
          </div>

          <button
            onClick={markAllRead}
            className="flex items-center gap-2 text-sm font-bold text-blue-200 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl border border-white/10"
          >
            <FaCheckDouble size={14} /> Mark all as read
          </button>
        </div>

        {/* Filters */}
        <div className="flex p-1.5 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 mb-8 overflow-x-auto no-scrollbar">
          {["all", "unread", "recommendation", "achievement", "streak", "system"].map((tab) => (
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

        {/* List */}
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`group relative flex items-start gap-5 p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer ${
                  n.isRead
                    ? "bg-white/5 border-white/5 opacity-80"
                    : "bg-white/15 border-white/20 shadow-xl shadow-blue-900/20"
                } ${n.type === 'recommendation' ? 'hover:bg-purple-500/10' : 'hover:bg-white/20'}`}
              >
                {!n.isRead && (
                  <div className="absolute top-6 right-6">
                    <FaCircle
                      className="text-blue-400 animate-pulse"
                      size={10}
                    />
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/10 text-2xl">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1">
                  <h3
                    className={`font-bold text-lg ${n.isRead ? "text-blue-100/70" : "text-white"}`}
                  >
                    {n.title}
                  </h3>
                  <p className="text-blue-100/60 text-sm leading-relaxed mb-3">
                    {n.message}
                  </p>
                  <span className="text-[10px] font-black uppercase tracking-tighter text-blue-300/40">
                    {n.time}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(n.id);
                    }}
                    className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
              <FaBell size={32} className="text-blue-100/20 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                No notifications found
              </h3>
              <p className="text-blue-100/40 text-sm">
                You're all caught up for now!
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default NotificationsPage;
