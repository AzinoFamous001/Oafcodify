import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Button from "../../Shared/Buttons";
import TextField from "../../Shared/Textfield";

import {
  FaGithub,
  FaGoogle,
  FaCode,
  FaCog,
  FaDatabase,
  FaServer,
  FaGlobe,
} from "react-icons/fa";
import SuccessModal from "../../Components/shared/Successmodal";

// Background component
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute top-[10%] left-[5%] animate-[spin_20s_linear_infinite] opacity-40">
      <FaCode size={120} className="text-white" />
    </div>
    <div className="absolute top-[60%] right-[10%] animate-[spin_25s_linear_infinite_reverse] opacity-30">
      <FaCog size={140} className="text-blue-200" />
    </div>
    <div className="absolute bottom-[15%] left-[10%] animate-bounce duration-[5000ms] opacity-20">
      <FaDatabase size={90} className="text-white" />
    </div>
    <div className="absolute top-[25%] right-[20%] animate-[spin_30s_linear_infinite] opacity-25">
      <FaServer size={110} className="text-blue-100" />
    </div>
    <div className="absolute top-[45%] left-[45%] animate-pulse opacity-10">
      <FaGlobe size={200} className="text-white" />
    </div>
  </div>
);

const LoginPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // FIX: ensure all required user data is stored
        localStorage.setItem("userName", data.user.fullName);
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("currentUserId", data.user.id);

        setShowSuccess(true);
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (err) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
      <AnimatedBackground />

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => navigate("/dashboard")}
        title="Welcome Back!"
        message="You have successfully logged into CodeBay."
      />

      <div className="relative z-10 w-full max-w-md md:max-w-4xl">
        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl border border-blue-100 overflow-hidden flex flex-col md:flex-row md:items-stretch">
          {/* LEFT */}
          <section className="flex flex-col items-center justify-center text-center md:w-2/5 bg-slate-50/80 p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-100">
            <img src="/Logo_6.png" alt="Logo" className="h-20 md:h-16" />
            <h1 className="text-2xl md:text-3xl mb-1.5 font-bold text-gray-800">
              CodeBay
            </h1>
            <p className="text-[#153498] font-medium italic mb-4 md:mb-6 text-sm md:text-base">
              Master Code. Build Future.
            </p>
            <div className="hidden md:block space-y-4 text-sm text-gray-600">
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <p className="font-semibold text-[#153498]">Welcome Back</p>
                <p className="mt-1 leading-relaxed">
                  Login to access your personalized learning dashboard.
                </p>
              </div>
            </div>
          </section>

          {/* RIGHT */}
          <div className="flex-1 px-6 py-8 md:px-12 md:py-10">
            <header className="mb-6 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Login</h2>
              <p className="text-gray-500 text-sm">Welcome back to CodeBay</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField
                label="Email Address"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <TextField
                label="Password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <div className="text-center md:text-left pt-1">
                <p className="text-sm text-gray-600">
                  New here?{" "}
                  <NavLink
                    to="/signup"
                    className="text-[#153498] font-semibold hover:underline"
                  >
                    Create account
                  </NavLink>
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full mt-2 md:mt-4 text-base font-semibold py-3 shadow-lg shadow-blue-200"
              >
                {loading ? "Authenticating..." : "Login"}
              </Button>
            </form>

            <div className="relative flex py-6 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-[10px] uppercase tracking-widest font-medium">
                Or login with
              </span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <button className="px-4 py-2.5 border border-gray-200 flex justify-center items-center rounded-2xl cursor-pointer hover:bg-gray-50 transition-all flex-1">
                <FaGithub size={18} className="mr-2 text-gray-700" />
                <span className="font-bold text-[11px] text-gray-700">
                  GitHub
                </span>
              </button>

              <button className="px-4 py-2.5 border border-gray-200 flex justify-center items-center rounded-2xl cursor-pointer hover:bg-gray-50 transition-all flex-1">
                <FaGoogle size={18} className="mr-2 text-gray-700" />
                <span className="font-bold text-[11px] text-gray-700">
                  Google
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
