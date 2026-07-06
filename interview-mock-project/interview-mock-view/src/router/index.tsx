import { createBrowserRouter, Navigate } from "react-router-dom";
import { RequireAuth } from "./RequireAuth";
import { BasicLayout } from "@/layouts/BasicLayout";
import { DashboardRoute, LoginRoute, UserManagementRoute } from "./LazyRoutes";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginRoute />,
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <BasicLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DashboardRoute />,
      },
      {
        path: "system/user",
        element: <UserManagementRoute />,
      },
    ],
  },
]);
