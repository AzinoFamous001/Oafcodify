import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  Menu,
  Settings,
  User,
  BarChart3,
  LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import SearchModal from "../../Components/shared/SearchModal";
import NotificationDropdown from "../../Components/shared/NotificationDropdown";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState("");
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
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

  // Load user avatar on mount (user-specific storage)
  useEffect(() => {
    const currentUserId = sessionStorage.getItem("currentUserId");
    if (!currentUserId) return;

    const avatarKey = `userAvatar_${currentUserId}`;
    const userNameKey = `userName_${currentUserId}`;
    const savedAvatar = localStorage.getItem(avatarKey);
    const userName = localStorage.getItem(userNameKey);
    if (savedAvatar && savedAvatar.startsWith("https://api.dicebear.com")) {
      setUserAvatar(savedAvatar);
    } else if (userName) {
      const newAvatar = generateCartoonAvatar(userName);
      setUserAvatar(newAvatar);
      localStorage.setItem(avatarKey, newAvatar);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ LOGOUT FIXED - Destroy server session only, keep localStorage data
  const handleLogout = async () => {
    sessionStorage.removeItem("currentUserId");

    // Call server logout to destroy session
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch (err) {
      console.error("Logout error:", err);
    }

    setIsDropdownOpen(false);
    navigate("/login");
  };

  // ✅ NAVIGATION FIXED
  const handleDropdownItemClick = (to) => {
    setIsDropdownOpen(false);
    navigate(to);
  };

  return (
    <nav className="w-full h-[70px] bg-white border-b border-gray-100 px-4 md:px-8 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      {/* Logo */}
      <NavLink to="/dashboard" className="flex items-center gap-2">
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <img src="/Logo_4.png" alt="C" className="h-10" />
        </div>
        <span className="text-2xl font-bold text-gray-800">Oafcodify</span>
      </NavLink>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
        >
          <Search size={20} />
        </button>

        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <NotificationDropdown isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
        </div>

        {/* Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 p-1 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
           
            <Menu size={20} />
          </button>

          {isDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 bg-black/20 z-40 md:hidden"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 top-[50px] w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="py-2">
                <DropdownItem
                  icon={<User size={18} />}
                  label="Profile"
                  to="/profile"
                  onClick={handleDropdownItemClick}
                />
                <DropdownItem
                  icon={<Settings size={18} />}
                  label="Settings"
                  to="/settings"
                  onClick={handleDropdownItemClick}
                />
                <DropdownItem
                  icon={<Bell size={18} />}
                  label="Notifications"
                  to="/notifications"
                  onClick={handleDropdownItemClick}
                />
                <DropdownItem
                  icon={<BarChart3 size={18} />}
                  label="Performance"
                  to="/performance"
                  onClick={handleDropdownItemClick}
                />

                <hr className="my-2 border-gray-50" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-medium"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
            </>
          )}
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  );
};

const DropdownItem = ({ icon, label, to, onClick }) => (
  <button
    onClick={() => onClick(to)}
    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700"
  >
    <span className="text-gray-400">{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
);

export default Navbar;
