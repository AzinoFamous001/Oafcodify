import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Recharts components for data viz
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
// React Icons
import {
  FaChartLine,
  FaArrowLeft,
  FaCode,
  FaCog,
  FaDatabase,
  FaServer,
  FaGlobe,
  FaFire,
  FaBullseye,
  FaHistory,
  FaLightbulb,
  FaCrown,
} from "react-icons/fa";

// --- ANIMATED BACKGROUND ---
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

// --- MOCK DATA FOR CHARTS ---
const performanceData = [
  { name: "Mon", score: 65, xp: 400 },
  { name: "Tue", score: 78, xp: 600 },
  { name: "Wed", score: 72, xp: 500 },
  { name: "Thu", score: 85, xp: 800 },
  { name: "Fri", score: 90, xp: 950 },
  { name: "Sat", score: 98, xp: 1200 },
  { name: "Sun", score: 92, xp: 1100 },
];

const skillData = [
  { subject: "JavaScript", A: 120, fullMark: 150 },
  { subject: "React", A: 98, fullMark: 150 },
  { subject: "HTML/CSS", A: 140, fullMark: 150 },
  { subject: "Python", A: 60, fullMark: 150 },
  { subject: "Logic", A: 110, fullMark: 150 },
  { subject: "Node.js", A: 85, fullMark: 150 },
];

const PerformancePage = () => {
  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen pb-20 bg-gradient-to-br from-blue-900 via-blue-600 to-indigo-900 overflow-hidden text-white">
      <AnimatedBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate(-1)}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all"
            >
              <FaArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-4xl font-black tracking-tight">Analytics</h1>
              <p className="text-blue-100/60 font-medium">
                Tracking your path to mastery
              </p>
            </div>
          </div>
          <div className="hidden md:flex bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 items-center gap-3">
            <FaCrown className="text-yellow-400" />
            <span className="font-bold">Global Rank: #1,240</span>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            icon={FaFire}
            label="Avg. Accuracy"
            value="88%"
            color="text-orange-400"
          />
          <SummaryCard
            icon={FaBullseye}
            label="Total XP"
            value="12,450"
            color="text-blue-400"
          />
          <SummaryCard
            icon={FaHistory}
            label="Quizzes"
            value="48"
            color="text-green-400"
          />
          <SummaryCard
            icon={FaLightbulb}
            label="Focus Area"
            value="React"
            color="text-purple-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart: Score Trend */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaChartLine className="text-blue-400" /> Proficiency Growth
              </h3>
              <select className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-1 text-sm outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.4)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.4)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                    }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#60a5fa"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorScore)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Skill Radar Chart */}
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl flex flex-col items-center">
            <h3 className="text-xl font-bold self-start mb-8">Skill Radar</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  data={skillData}
                >
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
                  />
                  <Radar
                    name="Level"
                    dataKey="A"
                    stroke="#818cf8"
                    fill="#818cf8"
                    fillOpacity={0.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Activity Bar Chart */}
          <div className="lg:col-span-3 bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl">
            <h3 className="text-xl font-bold mb-8">Weekly XP Earned</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.4)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "none",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="xp" radius={[10, 10, 0, 0]}>
                    {performanceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 5 ? "#fbbf24" : "#3b82f6"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

// --- HELPER COMPONENT ---
const SummaryCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 hover:scale-105 transition-all">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-slate-900/50 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-black">{value}</p>
        <p className="text-blue-100/40 text-xs font-bold uppercase tracking-widest">
          {label}
        </p>
      </div>
    </div>
  </div>
);

export default PerformancePage;
