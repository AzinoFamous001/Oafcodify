import React from "react";
import { FaCode, FaCog, FaDatabase, FaServer, FaGlobe } from "react-icons/fa";

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

export default AnimatedBackground;
