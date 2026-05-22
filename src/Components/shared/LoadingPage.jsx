import React from "react";
import { FaCode, FaLaptopCode, FaTerminal, FaPython } from "react-icons/fa";
import { SiReact } from "react-icons/si";

const LoadingPage = ({ message = "Loading..." }) => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-60">
        <div className="absolute top-[10%] left-[5%] animate-[spin_20s_linear_infinite] hidden sm:block">
          <FaLaptopCode size={120} className="text-white/60" />
        </div>
        <div className="absolute top-[60%] right-[10%] animate-[spin_25s_linear_infinite_reverse] hidden md:block">
          <FaTerminal size={100} className="text-blue-200/60" />
        </div>
        <div className="absolute bottom-[15%] left-[10%] animate-bounce duration-[5000ms]">
          <FaPython size={80} className="text-white/50" />
        </div>
        <div className="absolute top-[20%] right-[15%] animate-[spin_30s_linear_infinite] hidden lg:block">
          <SiReact size={110} className="text-blue-100/55" />
        </div>
        <div className="absolute top-[35%] left-[35%] animate-pulse hidden sm:block">
          <FaCode size={100} className="text-white/40" />
        </div>
      </div>

      {/* Loading Content */}
      <div className="relative z-10 text-center px-4">
        {/* Animated Spinner */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-400 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          <div className="absolute inset-4 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
        </div>

        {/* Loading Text */}
        <h1 className="text-4xl font-black tracking-tight text-white mb-4 animate-pulse">
          {message}
        </h1>
        
        {/* Animated Dots */}
        <div className="flex justify-center gap-2 mb-8">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingPage;
