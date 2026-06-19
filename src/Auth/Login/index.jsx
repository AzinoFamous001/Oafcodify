import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Button from "../../Shared/Buttons";
import TextField from "../../Shared/Textfield";
import LoadingPage from "../../Components/shared/LoadingPage";
import ErrorModal from "../../Components/shared/Errormodal";
import SuccessModal from "../../Components/shared/Successmodal";
import { updateLoginStreak } from "../../Shared/streakUtils";

import {
  FaGithub,
  FaGoogle,
  FaCode,
  FaCog,
  FaDatabase,
  FaServer,
  FaGlobe,
} from "react-icons/fa";


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

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");


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
      // Clear URL params to prevent re-processing
      window.history.replaceState({}, document.title, '/login');

      // Fetch user data from backend
      fetch('http://localhost:5000/api/auth/user', {
        credentials: 'include'
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Not authenticated');
        })
        .then(data => {
          // Store currentUserId in sessionStorage (tab-isolated) while user data stays in localStorage (persistent)
          sessionStorage.setItem('currentUserId', data.user.id);
          localStorage.setItem(`userName_${data.user.id}`, data.user.fullName);
          localStorage.setItem(`userEmail_${data.user.id}`, data.user.email);

          // Generate cartoon avatar (user-specific)
          const cartoonAvatar = generateCartoonAvatar(data.user.fullName);
          localStorage.setItem(`userAvatar_${data.user.id}`, cartoonAvatar);

          // Fetch user progress from backend
          fetch(`/api/user/${data.user.id}?action=progress`)
            .then(progressRes => {
              if (progressRes.ok) {
                return progressRes.json();
              }
              throw new Error('Failed to fetch progress');
            })
            .then(progressData => {
              // Sync quiz results from backend to localStorage
              if (progressData.quizResults && progressData.quizResults.length > 0) {
                localStorage.setItem(`quizResults_${data.user.id}`, JSON.stringify(progressData.quizResults));
              }

              // Sync lesson progress from backend to localStorage
              if (progressData.lessonProgress) {
                Object.keys(progressData.lessonProgress).forEach(key => {
                  const lessonData = progressData.lessonProgress[key];
                  if (lessonData.completed) {
                    localStorage.setItem(`${data.user.id}_${key}_completed`, JSON.stringify([0, 1, 2, 3, 4]));
                  }
                  if (lessonData.unlocked) {
                    localStorage.setItem(`${data.user.id}_${key}_unlocked`, 'true');
                  }
                });
              }

              // Sync streak from backend to localStorage
              if (progressData.streak) {
                if (progressData.streak.current) {
                  localStorage.setItem(`streak_${data.user.id}`, progressData.streak.current.toString());
                }
                if (progressData.streak.lastLogin) {
                  localStorage.setItem(`lastLogin_${data.user.id}`, progressData.streak.lastLogin);
                }
              }

              // Sync notifications from backend to localStorage
              if (progressData.notifications && progressData.notifications.length > 0) {
                localStorage.setItem(`notifications_${data.user.id}`, JSON.stringify(progressData.notifications));
              }

              // Sync completed courses from backend to localStorage
              if (progressData.completedCourses) {
                localStorage.setItem(`completedCourses_${data.user.id}`, progressData.completedCourses.toString());
              }
            })
            .catch(progressErr => {
              console.error('Error fetching user progress:', progressErr);
            });

          // Update login streak for OAuth users
          updateLoginStreak(data.user.id);
          setShowSuccess(true);
        })
        .catch(err => {
          console.error('OAuth callback error:', err);
          // Redirect to login if authentication failed
          navigate('/login');
        });
    }
  }, [navigate]);

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
        // Store currentUserId in sessionStorage (tab-isolated) while user data stays in localStorage (persistent)
        sessionStorage.setItem("currentUserId", data.user.id);
        localStorage.setItem(`userName_${data.user.id}`, data.user.fullName);
        localStorage.setItem(`userEmail_${data.user.id}`, data.user.email);
        
        // Generate cartoon avatar (user-specific)
        const cartoonAvatar = generateCartoonAvatar(data.user.fullName);
        localStorage.setItem(`userAvatar_${data.user.id}`, cartoonAvatar);

        // Fetch user progress from backend
        try {
          const progressResponse = await fetch(`/api/user/${data.user.id}?action=progress`);
          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            
            // Sync quiz results from backend to localStorage
            if (progressData.quizResults && progressData.quizResults.length > 0) {
              localStorage.setItem(`quizResults_${data.user.id}`, JSON.stringify(progressData.quizResults));
            }
            
            // Sync lesson progress from backend to localStorage
            if (progressData.lessonProgress) {
              Object.keys(progressData.lessonProgress).forEach(key => {
                const lessonData = progressData.lessonProgress[key];
                if (lessonData.completed) {
                  localStorage.setItem(`${data.user.id}_${key}_completed`, JSON.stringify([0, 1, 2, 3, 4]));
                }
                if (lessonData.unlocked) {
                  localStorage.setItem(`${data.user.id}_${key}_unlocked`, 'true');
                }
              });
            }
            
            // Sync streak from backend to localStorage
            if (progressData.streak) {
              if (progressData.streak.current) {
                localStorage.setItem(`streak_${data.user.id}`, progressData.streak.current.toString());
              }
              if (progressData.streak.lastLogin) {
                localStorage.setItem(`lastLogin_${data.user.id}`, progressData.streak.lastLogin);
              }
            }
            
            // Sync notifications from backend to localStorage
            if (progressData.notifications && progressData.notifications.length > 0) {
              localStorage.setItem(`notifications_${data.user.id}`, JSON.stringify(progressData.notifications));
            }
            
            // Sync completed courses from backend to localStorage
            if (progressData.completedCourses) {
              localStorage.setItem(`completedCourses_${data.user.id}`, progressData.completedCourses.toString());
            }
          }
        } catch (progressError) {
          console.error('Error fetching user progress:', progressError);
          // Continue with login even if progress sync fails
        }

        // Update login streak (preserves legitimate streaks)
        updateLoginStreak(data.user.id);

        setShowSuccess(true);
      } else {
        setErrorMessage(data.message || "Invalid credentials");
        setShowError(true);
      }
    } catch (err) {
      setErrorMessage("Server error");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingPage message="Authenticating..." />;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
      <AnimatedBackground />

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => navigate("/dashboard")}
        title="Welcome Back!"
        message="You have successfully logged into Oafcodify."
      />

      <ErrorModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        message={errorMessage}
      />

      <div className="relative z-10 w-full max-w-md md:max-w-4xl">
        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl border border-blue-100 overflow-hidden flex flex-col md:flex-row md:items-stretch">
          {/* LEFT */}
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

          {/* RIGHT */}
          <div className="flex-1 px-6 py-8 md:px-12 md:py-10">
            <header className="mb-6 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Login</h2>
              <p className="text-gray-500 text-sm">Welcome back to Oafcodify</p>
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
              <button
                type="button"
                onClick={() => window.location.href = "http://localhost:5000/api/auth/github?from=login"}
                className="px-4 py-2.5 border border-gray-200 flex justify-center items-center rounded-2xl cursor-pointer hover:bg-gray-50 transition-all flex-1"
              >
                <FaGithub size={18} className="mr-2 text-gray-700" />
                <span className="">Github</span>
              </button>

              <button
                type="button"
                onClick={() => window.location.href = "http://localhost:5000/api/auth/google?from=login"}
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

export default LoginPage;
