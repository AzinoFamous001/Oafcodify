import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  NavLink,
} from "react-router-dom";
import SignUpPage from "../Auth/Signup";
import LoginPage from "../Auth/Login";
import DashboardPage from "../Pages/Dashboard";
import MainLayout from "../Components/Layout/mainlayout";
import EditorPage from "../Editor";
import ProfilePage from "../Pages/Profile";
import NotificationsPage from "../Pages/Notification";
import SettingsPage from "../Pages/Setting";
import PerformancePage from "../Pages/Performance";
import LessonPage from "../Pages/Lesson";
import QuizPage from "../Pages/Quiz";
import QuizResultPage from "../Pages/QuizResult";
import Error404Page from "../Pages/Error404";
import CoursesPage from "../Pages/Courses";
import ProjectsPage from "../Pages/Projects";
import PricingPage from "../Pages/Pricing";
import RoadmapPage from "../Pages/Roadmap";
import HelpPage from "../Pages/Help";
import CommunityPage from "../Pages/Community";
import ContactPage from "../Pages/Contact";
import StatusPage from "../Pages/Status";
import PrivacyPage from "../Pages/Privacy";
import TermsPage from "../Pages/Terms";
import VideosPage from "../Pages/Videos";

const router = createBrowserRouter([
  // --- AUTH ROUTES ---
  {
    path: "/",
    element: <Navigate to="/signup" replace />,
  },
  {
    path: "/signup",
    element: <SignUpPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },

  // --- MAIN ROUTES ---
  {
    element: <MainLayout />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/editor",
        element: <EditorPage />,
      },
      {
        path: "/videos",
        element: <VideosPage />,
      },
      {
        path: "/quiz/:courseKey/:lessonId",
        element: <QuizPage />,
      },
      {
        path: "/quiz-result",
        element: <QuizResultPage />,
      },

      // ✅ FIXED ROUTE (IMPORTANT)
      {
        path: "/lesson/:courseKey/:lessonId",
        element: <LessonPage />,
      },

      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/notifications",
        element: <NotificationsPage />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
      {
        path: "/performance",
        element: <PerformancePage />,
      },

      // Footer pages
      {
        path: "/courses",
        element: <CoursesPage />,
      },
      {
        path: "/projects",
        element: <ProjectsPage />,
      },
      {
        path: "/pricing",
        element: <PricingPage />,
      },
      {
        path: "/roadmap",
        element: <RoadmapPage />,
      },
      {
        path: "/help",
        element: <HelpPage />,
      },
      {
        path: "/community",
        element: <CommunityPage />,
      },
      {
        path: "/contact",
        element: <ContactPage />,
      },
      {
        path: "/status",
        element: <StatusPage />,
      },
      {
        path: "/privacy",
        element: <PrivacyPage />,
      },
      {
        path: "/terms",
        element: <TermsPage />,
      },
    ],
  },

  // --- 404 ---
  {
    path: "*",
    element: <Error404Page />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
