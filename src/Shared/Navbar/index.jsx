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

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ LOGOUT FIXED
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");

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
        <span className="text-2xl font-bold text-gray-800">CodeBay</span>
      </NavLink>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-4">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
          <Search size={20} />
        </button>

        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>

          {isDropdownOpen && (
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
          )}
        </div>
      </div>
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
