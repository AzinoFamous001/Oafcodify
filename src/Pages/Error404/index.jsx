import React, { useEffect, useState } from "react";
import { useNavigate, useRouteError } from "react-router-dom";
import {
  FaHtml5, FaCss3Alt, FaJsSquare, FaPython,
  FaLaptopCode, FaTerminal, FaHome, FaBug,
} from "react-icons/fa";
import { SiReact, SiCplusplus } from "react-icons/si";

/* ─── Animated background (matches DashboardPage) ─── */
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-[0.18]">
    <div className="absolute top-[6%] left-[3%] animate-[spin_22s_linear_infinite] hidden sm:block">
      <FaLaptopCode size={120} className="text-white" />
    </div>
    <div className="absolute top-[55%] right-[5%] animate-[spin_18s_linear_infinite_reverse] hidden md:block">
      <FaTerminal size={100} className="text-blue-200" />
    </div>
    <div className="absolute bottom-[8%] left-[7%] animate-bounce" style={{ animationDuration: "5s" }}>
      <FaPython size={80} className="text-white" />
    </div>
    <div className="absolute top-[18%] right-[12%] animate-[spin_30s_linear_infinite] hidden lg:block">
      <SiReact size={110} className="text-blue-100" />
    </div>
    <div className="absolute top-[40%] left-[28%] animate-pulse hidden sm:block">
      <FaJsSquare size={90} className="text-white" />
    </div>
    <div className="absolute bottom-[20%] right-[22%] animate-bounce hidden lg:block" style={{ animationDuration: "7s" }}>
      <SiCplusplus size={70} className="text-blue-200" />
    </div>
  </div>
);

/* ─── Error pattern matcher ─── */
const getErrorInfo = () => {
  const pathname = window.location.pathname;
  const patterns = [
    { pattern: /^\/quiz\//,        type: "quiz",        title: "Quiz Not Found",          suggestion: "This quiz might be under development. Try navigating from the lessons page." },
    { pattern: /^\/lesson\//,      type: "lesson",      title: "Lesson Not Found",         suggestion: "This lesson might still be under development. Head back to the dashboard." },
    { pattern: /^\/dashboard\/?$/, type: "dashboard",   title: "Dashboard Unavailable",    suggestion: "The dashboard might be temporarily unavailable. Try refreshing." },
    { pattern: /^\/profile\/?$/,   type: "profile",     title: "Profile Unavailable",      suggestion: "Your profile might still be loading. Try again in a moment." },
    { pattern: /^\/performance\//, type: "performance", title: "Analytics Unavailable",    suggestion: "Performance data might be loading. Check your internet connection." },
    { pattern: /^\/editor\/?$/,    type: "editor",      title: "Editor Unavailable",       suggestion: "The code editor may be experiencing issues. Try refreshing." },
    { pattern: /^\/api\//,         type: "api",         title: "API Endpoint Missing",     suggestion: "This API endpoint doesn't exist or is temporarily down." },
    { pattern: /^\/admin\//,       type: "admin",       title: "Access Denied",            suggestion: "You don't have permission to access this area." },
  ];
  for (const { pattern, type, title, suggestion } of patterns) {
    if (pattern.test(pathname)) return { type, title, suggestion };
  }
  return {
    type: "general",
    title: "Page Not Found",
    suggestion: "The page you're looking for doesn't exist. Check the URL or navigate from the home page.",
  };
};

/* ─── Terminal typewriter line ─── */
const TerminalLine = ({ text, color = "text-green-300", delay = 0 }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return visible ? (
    <p className={`font-mono text-sm ${color} transition-opacity duration-300`}>{text}</p>
  ) : null;
};

/* ─── Quick link pill ─── */
const QuickLink = ({ icon, label, path, navigate }) => (
  <button
    onClick={() => navigate(path)}
    className="flex items-center gap-2 px-4 py-2.5 bg-white/8 hover:bg-white/20 border border-white/10 rounded-xl text-white/90 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 w-full"
  >
    {icon}
    <span>{label}</span>
  </button>
);

/* ─── Main Page ─── */
const Error404Page = () => {
  const navigate = useNavigate();
  const error = useRouteError?.();
  const errorInfo = getErrorInfo();

  const quickLinks = [
    { icon: <FaHtml5 size={15} className="text-orange-400" />,    label: "HTML5",       path: "/lesson/HTML5/1" },
    { icon: <FaCss3Alt size={15} className="text-blue-400" />,    label: "CSS3",        path: "/lesson/CSS3/1" },
    { icon: <FaJsSquare size={15} className="text-yellow-400" />, label: "JavaScript",  path: "/lesson/JavaScript/1" },
    { icon: <FaPython size={15} className="text-blue-300" />,     label: "Python",      path: "/lesson/Python/1" },
    { icon: <SiReact size={15} className="text-cyan-400" />,      label: "React",       path: "/lesson/React/1" },
    { icon: <FaLaptopCode size={15} className="text-white/70" />, label: "Playground",  path: "/editor" },
  ];

  const secondaryAction = {
    quiz:        { label: "Browse Lessons",  path: "/dashboard" },
    lesson:      { label: "Browse Lessons",  path: "/dashboard" },
    dashboard:   { label: "Try Again",       path: "/dashboard" },
    profile:     { label: "Try Again",       path: "/profile" },
    performance: { label: "Try Again",       path: "/performance" },
    editor:      { label: "Try Again",       path: "/editor" },
    api:         { label: "Go to Dashboard", path: "/dashboard" },
    admin:       { label: "Go to Dashboard", path: "/dashboard" },
    general:     { label: "Browse Lessons",  path: "/dashboard" },
  }[errorInfo.type];

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 overflow-hidden flex items-center justify-center px-4 py-16">
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center text-center gap-6">

        {/* Brand badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2">
          <span className="text-base">🏗️</span>
          <span className="text-blue-200 text-xs font-bold tracking-[.12em] uppercase">Oafcodify</span>
        </div>

        {/* Glitch 404 */}
        <div className="relative select-none" style={{ lineHeight: 1 }}>
          <h1
            className="font-mono font-black text-white"
            style={{ fontSize: "clamp(5.5rem, 24vw, 10rem)", letterSpacing: "-4px" }}
          >
            404
          </h1>
          <span
            aria-hidden="true"
            className="absolute inset-0 font-mono font-black text-blue-400"
            style={{ fontSize: "clamp(5.5rem, 24vw, 10rem)", letterSpacing: "-4px", animation: "glitch1 3s steps(1) infinite" }}
          >
            404
          </span>
          <span
            aria-hidden="true"
            className="absolute inset-0 font-mono font-black text-violet-400"
            style={{ fontSize: "clamp(5.5rem, 24vw, 10rem)", letterSpacing: "-4px", animation: "glitch2 3s steps(1) infinite 0.12s" }}
          >
            404
          </span>
        </div>

        {/* Error title & suggestion */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-snug">
            {errorInfo.title} 🐛
          </h2>
          <p className="text-blue-100/75 text-base leading-relaxed max-w-md mx-auto">
            {errorInfo.suggestion}
          </p>
        </div>

        {/* Terminal card */}
        <div className="w-full bg-slate-900/70 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4 text-left shadow-xl">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="w-3 h-3 rounded-full bg-red-400/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
            <span className="w-3 h-3 rounded-full bg-green-400/80" />
            <span className="ml-2 text-white/30 text-xs font-mono">codebay — bash</span>
          </div>
          <TerminalLine text={`$ navigate ${window.location.pathname}`} color="text-blue-200" delay={0} />
          <TerminalLine text="Error: 404 — No such route or resource" color="text-red-300" delay={600} />
          <TerminalLine text={`Hint: ${errorInfo.suggestion.split(".")[0]}.`} color="text-yellow-200/80" delay={1200} />
          <p className="font-mono text-sm text-green-300 mt-1">
            ${" "}
            <span className="after:content-['▋'] after:animate-[blink_1s_step-start_infinite]" />
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-blue-900 font-bold rounded-xl text-sm hover:bg-blue-50 hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-200"
          >
            <FaHome size={15} />
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate(secondaryAction.path)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 text-white font-semibold rounded-xl text-sm border border-white/25 hover:bg-white/20 hover:-translate-y-0.5 transition-all duration-200"
          >
            {secondaryAction.label}
          </button>
        </div>

        {/* Quick links */}
        <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
          <p className="text-blue-300 text-[10px] font-bold tracking-[.12em] uppercase mb-4 text-left">
            Quick Links
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {quickLinks.map((l) => (
              <QuickLink key={l.label} {...l} navigate={navigate} />
            ))}
          </div>
        </div>

        {/* Report bug */}
        <div className="w-full bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5">
          <p className="text-white font-bold mb-1">Still having trouble?</p>
          <p className="text-blue-100/70 text-sm mb-4">
            If you think this is a bug on our end, let us know.
          </p>
          <button
            onClick={() =>
              window.open("mailto:support@codebay.com?subject=Bug Report — 404", "_blank")
            }
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500/80 hover:bg-red-500 text-white font-semibold rounded-xl text-sm border border-red-400/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            <FaBug size={14} />
            Report a Bug
          </button>
        </div>

        {/* Footer note */}
        <p className="font-mono text-blue-300/40 text-xs">
          HTTP 404 · Page not found · Oafcodify v1.0
        </p>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes glitch1 {
          0%,100% { clip-path: inset(0 0 90% 0);   transform: translate(-4px, 0); }
          20%     { clip-path: inset(30% 0 50% 0);  transform: translate(4px, 0);  }
          40%     { clip-path: inset(60% 0 20% 0);  transform: translate(-3px, 0); }
          60%     { clip-path: inset(80% 0 5% 0);   transform: translate(3px, 0);  }
          80%     { clip-path: inset(10% 0 75% 0);  transform: translate(-2px, 0); }
        }
        @keyframes glitch2 {
          0%,100% { clip-path: inset(70% 0 10% 0);  transform: translate(4px, 0);  }
          25%     { clip-path: inset(20% 0 60% 0);  transform: translate(-4px, 0); }
          50%     { clip-path: inset(50% 0 30% 0);  transform: translate(3px, 0);  }
          75%     { clip-path: inset(5% 0 85% 0);   transform: translate(-3px, 0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0; }
        }
      `}</style>
    </main>
  );
};

export default Error404Page;


