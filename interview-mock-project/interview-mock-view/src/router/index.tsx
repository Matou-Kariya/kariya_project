import { createBrowserRouter, Navigate } from "react-router-dom";
import { RequireAuth } from "./RequireAuth";
import { BasicLayout } from "@/layouts";
import { LoginRoute } from "./LazyRoutes";
import { ConsoleLayoutLoading } from "@/components/ConsoleLayoutLoading";
import NotFound from "@/pages/Error/NotFound";
import NoPermission from "@/pages/Error/NoPermission";
import { buildDynamicRoutes } from "./dynamicRoutes";
import type { DbMenu } from "@/types/menu";

export function createAppRouter(menus: DbMenu[] = []) {
  const dynamicRoutes = buildDynamicRoutes(menus);

  return createBrowserRouter([
    {
      path: "/login",
      element: <LoginRoute />,
    },
    {
      path: "/401",
      element: <NoPermission />,
    },
    {
      path: "/",
      element: (
        <RequireAuth loading={<ConsoleLayoutLoading />}>
          <BasicLayout />
        </RequireAuth>
      ),
      errorElement: <NotFound />,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboard" replace />,
        },
        ...dynamicRoutes,
      ],
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);
}
