import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaBell,
  FaPalette,
  FaArrowLeft,
  FaCheck,
  FaCode,
  FaSignOutAlt,
  FaTrashAlt,
  FaInfoCircle,
  FaDatabase,
} from "react-icons/fa";
import { resetStreak } from "../../Shared/streakUtils";
import SuccessModal from "../../Components/shared/Successmodal";

// --- MINIMAL BACKGROUND ---
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

const SettingsPage = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    publicRank: true,
  });

  // --- LOAD USER DATA ---
  useEffect(() => {
    const currentId = sessionStorage.getItem("currentUserId");
    if (!currentId) {
      navigate("/login");
      return;
    }
    setUserId(currentId);

    setUserName(localStorage.getItem(`userName_${currentId}`) || "Student");
    setUserEmail(localStorage.getItem(`userEmail_${currentId}`) || "student@school.com");

    // Load user-specific settings if they exist
    const savedSettings = localStorage.getItem(`settings_${currentId}`);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [navigate]);

  const handleSave = async () => {
    // Save Profile Info with userId prefix for complete user isolation
    localStorage.setItem(`userName_${userId}`, userName);
    localStorage.setItem(`userEmail_${userId}`, userEmail);
    // Save Toggles
    localStorage.setItem(`settings_${userId}`, JSON.stringify(settings));

    // Sync profile info to backend
    try {
      await fetch(`/api/user/${userId}?action=profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: userName, email: userEmail })
      });
    } catch (err) {
      console.error('Error syncing profile to backend:', err);
    }

    setShowSuccess(true);
  };

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = async () => {
    sessionStorage.removeItem("currentUserId");

    // Call server logout to destroy session
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch (err) {
      console.error("Logout error:", err);
    }

    navigate("/login");
  };

  return (
    <main className="relative min-h-screen pb-20 bg-gradient-to-br from-blue-900 to-indigo-900 text-white overflow-x-hidden">
      <AnimatedBackground />

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Settings Saved!"
        message="Your settings have been updated successfully."
        buttonText="OK"
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-10">
        {/* Header */}
        <div className="flex items-center gap-6 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
          >
            <FaArrowLeft size={18} />
          </button>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* 1. PERSONAL INFO */}
          <section className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-blue-400">
              <FaUser size={16} /> Account Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </section>

          {/* 2. APP PREFERENCES */}
          <section className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-yellow-400">
              <FaPalette size={16} /> Learning Preferences
            </h3>
            <div className="space-y-4">
              <ToggleRow
                title="Enable Notifications"
                desc="Get reminded about daily streaks and new tasks."
                active={settings.notifications}
                onClick={() => toggleSetting("notifications")}
              />
              <ToggleRow
                title="Public Leaderboard"
                desc="Show your rank and XP to other students."
                active={settings.publicRank}
                onClick={() => toggleSetting("publicRank")}
              />
            </div>
          </section>

          {/* 3. DANGER ZONE */}
          <section className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-400">
              <FaTrashAlt size={16} /> Danger Zone
            </h3>
            <p className="text-sm text-white/40 mb-4">
              Once you delete your data, it cannot be recovered.
            </p>
            <button
              onClick={() => {
                if (window.confirm("Reset all your progress?")) {
                  const currentUserId = sessionStorage.getItem("currentUserId");
                  // Clear only current user's data (not all users)
                  if (currentUserId) {
                    const keysToRemove = [];
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key.startsWith(`${currentUserId}_`) || key === `userName_${currentUserId}` || key === `userEmail_${currentUserId}` || key === `userAvatar_${currentUserId}` || key === `settings_${currentUserId}` || key === `streak_${currentUserId}` || key === `notifications_${currentUserId}` || key === `quizResults_${currentUserId}`) {
                        keysToRemove.push(key);
                      }
                    }
                    keysToRemove.forEach(key => localStorage.removeItem(key));
                    resetStreak(currentUserId);
                  }
                  navigate("/");
                }
              }}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-lg border border-red-500/20 transition-all"
            >
              Reset All Progress
            </button>
          </section>

          {/* SAVE BUTTON */}
          <div className="flex justify-between items-center pt-6">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-white/30 hover:text-white text-sm font-bold transition-all"
            >
              <FaSignOutAlt /> Logout
            </button>
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-900/40 transition-all"
            >
              <FaCheck /> Save Settings
            </button>
          </div>
        </div>

        <p className="text-center mt-10 text-[10px] text-white/20 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
          <FaInfoCircle /> Oafcodify School Edition v1.0
        </p>
      </div>
    </main>
  );
};

// --- MINIMAL TOGGLE ROW ---
const ToggleRow = ({ title, desc, active, onClick }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <h4 className="text-sm font-bold text-white">{title}</h4>
      <p className="text-xs text-white/40">{desc}</p>
    </div>
    <button
      onClick={onClick}
      className={`relative w-12 h-6 rounded-full transition-colors ${active ? "bg-blue-500" : "bg-white/10"}`}
    >
      <div
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${active ? "translate-x-6" : "translate-x-0"}`}
      />
    </button>
  </div>
);

export default SettingsPage;
