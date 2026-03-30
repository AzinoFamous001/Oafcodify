import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import {
  FaPlay,
  FaCode,
  FaTerminal,
  FaTrash,
  FaSun,
  FaMoon,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const LANGUAGE_DEFAULTS = {
  javascript:
    "console.log('Hello from JavaScript!');\n\nconst sum = (a, b) => a + b;\nconsole.log('Sum:', sum(10, 5));",
  html: "<!DOCTYPE html>\n<html>\n<body>\n  <h1>Hello CodeBay!</h1>\n  <p>HTML is rendered in a preview window.</p>\n</body>\n</html>",
  css: "body {\n  background-color: #f0f0f0;\n  color: #333;\n  font-family: sans-serif;\n}",
  python:
    "# Python execution usually requires a backend.\nprint('Hello from Python!')\n\nfor i in range(5):\n    print(f'Count: {i}')",
  cpp: '// C++ requires a backend compiler.\n#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    return 0;\n}',
  react:
    "import React from 'react';\n\nfunction App() {\n  return <h1>Hello from React!</h1>;\n}\n\nexport default App;",
};

const EditorPage = () => {
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("vs-dark");
  const [code, setCode] = useState(LANGUAGE_DEFAULTS.javascript);
  const [output, setOutput] = useState([]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true); // For mobile

  // Update code template when language changes
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(LANGUAGE_DEFAULTS[newLang]);
    setOutput([]);
  };

  const toggleTheme = () => {
    setTheme(theme === "vs-dark" ? "light" : "vs-dark");
  };

  const handleClose = () => {
    window.history.back();
  };

  const runCode = () => {
    setOutput([]);

    if (language === "javascript") {
      try {
        const logs = [];
        const customConsole = {
          log: (...args) => {
            logs.push(
              args
                .map((arg) =>
                  typeof arg === "object" ? JSON.stringify(arg) : String(arg),
                )
                .join(" "),
            );
          },
          error: (err) => logs.push(`Error: ${err}`),
        };
        const execute = new Function("console", code);
        execute(customConsole);
        setOutput(
          logs.length > 0 ? logs : ["> Code executed successfully (no output)"],
        );
      } catch (err) {
        setOutput([`Error: ${err.message}`]);
      }
    } else if (["html", "css", "react"].includes(language)) {
      setOutput([
        `> Detected ${language.toUpperCase()}. In a production environment, this would render in a Live Preview window.`,
      ]);
    } else {
      setOutput([
        `> Execution for ${language.toUpperCase()} requires a backend compiler.`,
        `> Connecting to remote server...`,
        `> Error: No backend compiler connected.`,
      ]);
    }
  };

  return (
    <div
      className={`h-screen flex flex-col overflow-hidden ${
        theme === "vs-dark" ? "bg-[#1e1e1e]" : "bg-gray-100"
      }`}
    >
      {/* TOOLBAR - Responsive */}
      <div
        className={`${
          theme === "vs-dark"
            ? "bg-[#2d2d2d] border-white/10"
            : "bg-white border-gray-200"
        } px-4 sm:px-6 py-3 flex items-center justify-between border-b flex-wrap gap-3`}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-blue-500 font-bold">
            <FaCode size={20} />
            <span
              className={`text-lg font-semibold ${
                theme === "vs-dark" ? "text-blue-400" : "text-blue-600"
              }`}
            >
              CodeBay
            </span>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className={`text-sm rounded-lg px-3 py-1.5 outline-none border font-medium transition-all ${
                theme === "vs-dark"
                  ? "bg-[#3c3c3c] text-gray-300 border-gray-600 focus:border-blue-500"
                  : "bg-gray-200 text-gray-800 border-gray-300 focus:border-blue-500"
              }`}
            >
              <option value="javascript">JavaScript</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="react">React (JSX)</option>
            </select>

            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all ${
                theme === "vs-dark"
                  ? "bg-[#3c3c3c] text-yellow-400 hover:bg-[#4a4a4a]"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              {theme === "vs-dark" ? <FaSun size={16} /> : <FaMoon size={16} />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runCode}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95"
          >
            <FaPlay size={13} />{" "}
            <span className="hidden sm:inline">Run Code</span>
          </button>

          <button
            onClick={handleClose}
            className={`p-2 rounded-full transition-colors ${
              theme === "vs-dark"
                ? "text-gray-400 hover:bg-red-500/20 hover:text-red-400"
                : "text-gray-600 hover:bg-red-100 hover:text-red-600"
            }`}
          >
            <FaTimes size={20} />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r border-white/10">
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              theme={theme}
              language={language === "react" ? "javascript" : language}
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{
                fontSize: 15,
                minimap: { enabled: false },
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                wordWrap: "on",
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </div>

        {/* Terminal / Output Panel */}
        <div
          className={`flex flex-col ${
            isTerminalOpen
              ? "flex-1 lg:w-1/3 lg:min-w-[380px]"
              : "h-14 lg:h-auto lg:w-1/3 lg:min-w-[380px]"
          } ${
            theme === "vs-dark" ? "bg-[#0d0d0d]" : "bg-gray-50"
          } border-t lg:border-t-0 lg:border-l border-white/10 transition-all duration-300`}
        >
          {/* Terminal Header - Clickable on Mobile */}
          <div
            className={`flex items-center justify-between px-4 py-3 border-b ${
              theme === "vs-dark"
                ? "border-white/10 bg-[#181818]"
                : "border-gray-200 bg-gray-100"
            } cursor-pointer lg:cursor-default`}
            onClick={() =>
              window.innerWidth < 1024 && setIsTerminalOpen(!isTerminalOpen)
            }
          >
            <div
              className={`flex items-center gap-2 text-xs font-mono font-bold tracking-wider ${
                theme === "vs-dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <FaTerminal /> TERMINAL OUTPUT
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOutput([]);
                }}
                className="text-gray-500 hover:text-red-400 transition-colors p-1"
              >
                <FaTrash size={13} />
              </button>

              {/* Mobile Toggle */}
              <div className="lg:hidden">
                {isTerminalOpen ? (
                  <FaChevronUp size={16} />
                ) : (
                  <FaChevronDown size={16} />
                )}
              </div>
            </div>
          </div>

          {/* Terminal Content */}
          <div
            className={`flex-1 overflow-y-auto p-4 font-mono text-sm leading-relaxed transition-all duration-300 ${
              isTerminalOpen ? "block" : "hidden lg:block"
            }`}
          >
            {output.length === 0 ? (
              <span className="text-gray-500 italic">
                {"> System ready. Click 'Run Code' to execute..."}
              </span>
            ) : (
              output.map((line, index) => (
                <div
                  key={index}
                  className={`mb-1 ${
                    line.toLowerCase().includes("error")
                      ? "text-red-400"
                      : theme === "vs-dark"
                        ? "text-green-400"
                        : "text-green-600"
                  }`}
                >
                  {line}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
