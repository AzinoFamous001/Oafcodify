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
    ],
  },

  // --- 404 ---
  {
    path: "*",
    element: (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold text-gray-800">404</h1>
        <p className="text-gray-600 mb-4">Oops! This page doesn't exist.</p>
        <NavLink
          to="/signup"
          className="text-blue-600 font-semibold hover:underline"
        >
          Go back home
        </NavLink>
      </div>
    ),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
