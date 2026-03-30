import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  NavLink,
  Outlet,
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

const router = createBrowserRouter([
  // --- AUTH ROUTES (No Navbar/Footer) ---
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

  // --- MAIN ROUTES (With Navbar & Footer) ---
  {
    element: <MainLayout />, // Wrap these routes in the layout
    children: [
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      { path: "editor", element: <EditorPage /> },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "notifications",
        element: <NotificationsPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "performance",
        element: <PerformancePage />,
      },
      // You can add more pages here later, like /profile or /settings
    ],
  },

  // --- 404 PAGE ---
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
