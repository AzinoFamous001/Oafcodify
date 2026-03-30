import React, { useState } from "react";
import {
  Search,
  Bell,
  Menu,
  Settings,
  User,
  BarChart3,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="w-full h-[70px] bg-white border-b border-gray-100 px-4 md:px-8 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      {/* Left Side: Logo and Branding */}
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <img src="/Logo_4.png" alt="C" className="h-10" />
        </div>
        <span className="text-2xl font-bold text-gray-800">CodeBay</span>
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* 2. Search Icon */}
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Search size={20} />
        </button>

        {/* 3. Notification Icon */}
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* 4. Hamburger Icon with Hover Dropdown */}
        <div className="relative group py-4">
          {/* The 'py-4' creates a bridge so the mouse doesn't leave the hover zone */}
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Menu size={24} />
          </button>

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-[60px] w-56 bg-white border border-gray-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:top-[50px] transition-all duration-200 z-50 overflow-hidden">
            <div className="py-2">
              <NavLink to="/profile">
                <DropdownItem
                  icon={<User size={18} />}
                  label="Profile"
                  to="/profile"
                />
              </NavLink>
              <NavLink to="/settings">
                <DropdownItem
                  icon={<Settings size={18} />}
                  label="Settings"
                  to="/settings"
                />
              </NavLink>
              <NavLink to="/notifications">
                <DropdownItem
                  icon={<Bell size={18} />}
                  label="Notifications"
                  to="/notifications"
                />
              </NavLink>
              <NavLink to="/performance">
                <DropdownItem
                  icon={<BarChart3 size={18} />}
                  label="Performance"
                  to="/performance"
                />
              </NavLink>

              <hr className="my-2 border-gray-50" />

              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Helper Component for Dropdown Items
const DropdownItem = ({ icon, label, to }) => (
  <NavLink
    to={to}
    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
  >
    <span className="text-gray-400 group-hover:text-blue-600">{icon}</span>
    <span className="font-medium">{label}</span>
  </NavLink>
);

export default Navbar;
