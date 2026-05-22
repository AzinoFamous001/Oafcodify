import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Button from "../../Shared/Buttons";
import TextField from "../../Shared/Textfield";
import LoadingPage from "../../Components/shared/LoadingPage";
import { resetStreak } from "../../Shared/streakUtils";

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

// Background component EXACTLY SAME
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

const SignupPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  // Storage for the user ID returned by the API
  const [receivedUserId, setReceivedUserId] = useState(null);

  // Update login streak
  const updateLoginStreak = (userId) => {
    const streakKey = `streak_${userId}`;
    const lastLoginKey = `lastLogin_${userId}`;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    const lastLoginStr = localStorage.getItem(lastLoginKey);

    let streak = 0;
    const savedStreak = localStorage.getItem(streakKey);
    if (savedStreak && !isNaN(savedStreak)) {
      streak = Math.max(0, parseInt(savedStreak));
    }

    if (!lastLoginStr) {
      streak = 1;
      localStorage.setItem(lastLoginKey, todayStr);
      localStorage.setItem(streakKey, streak.toString());
    } else {
      if (lastLoginStr === todayStr) {
        return streak;
      }

      const lastLoginDate = new Date(lastLoginStr);
      lastLoginDate.setHours(0, 0, 0, 0);

      const diffTime = today - lastLoginDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak += 1;
        localStorage.setItem(lastLoginKey, todayStr);
        localStorage.setItem(streakKey, streak.toString());
      } else if (diffDays > 1) {
        streak = 1;
        localStorage.setItem(lastLoginKey, todayStr);
        localStorage.setItem(streakKey, streak.toString());
      } else if (diffDays < 0) {
        streak = 1;
        localStorage.setItem(lastLoginKey, todayStr);
        localStorage.setItem(streakKey, streak.toString());
      }
    }

    return Math.max(0, streak);
  };

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

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get('auth');

    if (authSuccess === 'success') {
      // Fetch user data from backend
      fetch('http://localhost:5000/api/auth/user', {
        credentials: 'include'
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Not authenticated');
        })
        .then(data => {
          localStorage.setItem('userName', data.user.fullName);
          localStorage.setItem('userEmail', data.user.email);
          localStorage.setItem('currentUserId', data.user.id);
          // Generate cartoon avatar if not already set
          const cartoonAvatar = generateCartoonAvatar(data.user.fullName);
          localStorage.setItem('userAvatar', cartoonAvatar);
          // Update login streak for OAuth users
          updateLoginStreak(data.user.id);
          // Show success modal instead of direct navigation
          setShowSuccess(true);
        })
        .catch(err => {
          console.error('OAuth callback error:', err);
          navigate('/signup');
        });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Min 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords mismatch";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // SAVE DATA TO STATE, NOT LOCALSTORAGE (Prevents auto-redirect)
        setReceivedUserId(data?.user?._id || "local-user");
        setShowSuccess(true);
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  // Logic to execute when "Continue" is clicked
  const handleFinalizeSignup = () => {
    localStorage.setItem("userName", formData.fullName);
    localStorage.setItem("userEmail", formData.email);
    localStorage.setItem("currentUserId", receivedUserId);
    // Force reset streak to 1 for new account to prevent persistence from deleted accounts
    resetStreak(receivedUserId);
    navigate("/dashboard");
  };

  if (loading) {
    return <LoadingPage message="Creating Account..." />;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
      <AnimatedBackground />

      <SuccessModal
        isOpen={showSuccess}
        onClose={handleFinalizeSignup}
        title="Success!"
        message="Your account has been created successfully."
      />

      <div className="relative z-10 w-full max-w-md md:max-w-4xl">
        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl border border-blue-100 overflow-hidden flex flex-col md:flex-row md:items-stretch">
          <section className="flex flex-col items-center justify-center text-center md:w-2/5 bg-slate-50/80 p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-100">
            <img src="/Logo_6.png" alt="Logo" className="h-20 md:h-16" />
            <h1 className="text-2xl md:text-3xl mb-1.5 font-bold text-gray-800">
              Oafcodify
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

          <div className="flex-1 px-6 py-8 md:px-12 md:py-10">
            <header className="mb-6 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Create your account
              </h2>
              <p className="text-gray-500 text-sm">
                Join thousands of developers on Oafcodify
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField
                label="Full Name"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                required
              />

              <TextField
                label="Email Address"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="Password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                />

                <TextField
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  required
                />
              </div>

              <div className="text-center md:text-left pt-1">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <NavLink
                    to="/login"
                    className="text-[#153498] font-semibold hover:underline"
                  >
                    Log in
                  </NavLink>
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full mt-2 md:mt-4 text-base font-semibold py-3 shadow-lg shadow-blue-200"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="relative flex py-6 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-[10px] uppercase tracking-widest font-medium">
                Or register with
              </span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <button
                type="button"
                onClick={() => window.location.href = "http://localhost:5000/api/auth/github"}
                className="px-4 py-2.5 border border-gray-200 flex justify-center items-center rounded-2xl cursor-pointer hover:bg-gray-50 transition-all flex-1"
              >
                <FaGithub size={18} className="mr-2 text-gray-700" />
                <span>Github</span>
              </button>

              <button
                type="button"
                onClick={() => window.location.href = "http://localhost:5000/api/auth/google"}
                className="px-4 py-2.5 border border-gray-200 flex justify-center items-center rounded-2xl cursor-pointer hover:bg-gray-50 transition-all flex-1"
              >
                <FaGoogle size={18} className="mr-2 text-gray-700" />
                <span>Google</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
