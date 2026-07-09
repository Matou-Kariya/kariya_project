import { useMemo } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RouteObject } from "react-router-dom";
import type { RootState } from "@/store";
import { RequireAuth } from "./RequireAuth";
import { BasicLayout } from "@/layouts";
import { LoginRoute } from "./LazyRoutes";
import { buildDynamicRoutes } from "./dynamicRoutes";
import NotFound from "@/pages/Error/NotFound";
import NoPermission from "@/pages/Error/NoPermission";
import { ConsoleLayoutLoading } from "@/components/ConsoleLayoutLoading";

export function AppRoutes() {
  const menus = useSelector((state: RootState) => state.user.menus);

  const routes = useMemo<RouteObject[]>(() => {
    const dynamicRoutes = buildDynamicRoutes(menus);

    return [
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
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          ...dynamicRoutes,
          {
            path: "*",
            element: <NotFound />,
          },
        ],
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ];
  }, [menus]);

  return useRoutes(routes);
}
