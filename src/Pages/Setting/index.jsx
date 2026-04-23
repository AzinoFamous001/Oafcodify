import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// All icons from react-icons
import {
  FaUser,
  FaBell,
  FaLock,
  FaPalette,
  FaGlobe,
  FaShieldAlt,
  FaArrowLeft,
  FaCamera,
  FaCheck,
  FaCode,
  FaCog,
  FaDatabase,
  FaServer,
  FaFire,
  FaSignOutAlt,
  FaTrashAlt,
} from "react-icons/fa";

// --- ANIMATED BACKGROUND COMPONENT (Theme Consistency) ---
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

const SettingsPage = () => {
  const navigate = useNavigate();

  // State for toggles
  const [settings, setSettings] = useState({
    emailNotifications: true,
    streakReminders: true,
    publicProfile: false,
    reducedMotion: false,
    twoFactor: false,
  });

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <main className="relative min-h-screen pb-20 bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-10">
        {/* Header */}
        <div className="flex items-center gap-6 mb-12">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/10 transition-all"
          >
            <FaArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Settings
            </h1>
            <p className="text-blue-100/60 font-medium">
              Manage your account and preferences
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* 1. PROFILE SECTION */}
          <section className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <FaUser className="text-blue-400" /> Public Profile
            </h3>

            <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b border-white/10">
              <div className="relative group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-2xl overflow-hidden ring-4 ring-blue-200/30 flex-shrink-0">
                  <img
                    src="/Logo_.jpg"
                    alt="Dev"
                    className="w-full h-full object-cover"
                    onError={(e) =>
                      (e.target.src =
                        "https://ui-avatars.com/api/?name=Dev&background=0D8ABC&color=fff")
                    }
                  />
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full border-2 border-slate-900 group-hover:scale-110 transition-transform">
                  <FaCamera size={14} />
                </button>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-widest text-blue-100/40 ml-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Developer Name"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-widest text-blue-100/40 ml-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue="dev@codebay.com"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <ToggleRow
              icon={FaGlobe}
              title="Public Profile"
              desc="Allow others to see your achievements and rank."
              active={settings.publicProfile}
              onClick={() => toggleSetting("publicProfile")}
            />
          </section>

          {/* 2. NOTIFICATIONS SECTION */}
          <section className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <FaBell className="text-yellow-400" /> Notifications
            </h3>
            <div className="space-y-6">
              <ToggleRow
                icon={FaBell}
                title="Email Notifications"
                desc="Receive weekly progress reports and new course alerts."
                active={settings.emailNotifications}
                onClick={() => toggleSetting("emailNotifications")}
              />
              <ToggleRow
                icon={FaFire}
                title="Streak Reminders"
                desc="Get notified when your daily streak is about to expire."
                active={settings.streakReminders}
                onClick={() => toggleSetting("streakReminders")}
              />
            </div>
          </section>

          {/* 3. SECURITY & PRIVACY */}
          <section className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <FaShieldAlt className="text-green-400" /> Security
            </h3>
            <div className="space-y-6 mb-8">
              <ToggleRow
                icon={FaLock}
                title="Two-Factor Authentication"
                desc="Add an extra layer of security to your account."
                active={settings.twoFactor}
                onClick={() => toggleSetting("twoFactor")}
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold transition-all">
                Change Password
              </button>
              <button className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl font-bold transition-all flex items-center gap-2">
                <FaTrashAlt size={14} /> Delete Account
              </button>
            </div>
          </section>

          {/* 4. PREFERENCES */}
          <section className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <FaPalette className="text-purple-400" /> Preferences
            </h3>
            <ToggleRow
              icon={FaCog}
              title="Reduced Motion"
              desc="Minimize background animations for better performance."
              active={settings.reducedMotion}
              onClick={() => toggleSetting("reducedMotion")}
            />
          </section>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-blue-900/40 flex items-center gap-3 transition-all transform hover:-translate-y-1">
              <FaCheck /> Save Changes
            </button>
          </div>
        </div>

        {/* Logout Footer */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 text-blue-100/40 hover:text-red-400 font-bold transition-colors"
          >
            <FaSignOutAlt /> Sign Out of CodeBay
          </button>
        </div>
      </div>
    </main>
  );
};

// --- HELPER COMPONENT: TOGGLE ROW ---

const ToggleRow = ({ icon: Icon, title, desc, active, onClick }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex items-start gap-4">
      <div className="p-3 bg-slate-900/50 rounded-xl border border-white/10 text-blue-400">
        <Icon size={20} />
      </div>
      <div>
        <h4 className="text-white font-bold">{title}</h4>
        <p className="text-blue-100/40 text-sm max-w-md">{desc}</p>
      </div>
    </div>
    <button
      onClick={onClick}
      className={`relative w-14 h-7 rounded-full transition-colors duration-300 outline-none ${
        active ? "bg-blue-500" : "bg-slate-700"
      }`}
    >
      <div
        className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
          active ? "translate-x-7" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

export default SettingsPage;
