import { createBrowserRouter, Navigate } from "react-router-dom";
import { RequireAuth } from "./RequireAuth";
import { BasicLayout } from "@/layouts";
import { DashboardRoute, LoginRoute } from "./LazyRoutes";
import { ConsoleLayoutLoading } from "@/components/ConsoleLayoutLoading";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginRoute />,
  },
  {
    path: "/",
    element: (
      <RequireAuth loading={<ConsoleLayoutLoading />}>
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
        handle: { title: "仪表盘" },
      },
    ],
  },
]);
