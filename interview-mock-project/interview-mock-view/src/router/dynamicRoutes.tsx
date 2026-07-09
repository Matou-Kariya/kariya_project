import { Suspense } from "react";
import type { RouteObject } from "react-router-dom";
import { resolvePageComponent } from "./componentResolver";
import { ConsoleLayoutLoading } from "@/components/ConsoleLayoutLoading";
import NotFound from "@/pages/Error/NotFound";
import type { DbMenu } from "@/types/menu";

function flattenMenus(menus: DbMenu[]) {
  const result: DbMenu[] = [];

  const walk = (items: DbMenu[]) => {
    items.forEach((item) => {
      result.push(item);
      if (item.children?.length) walk(item.children);
    });
  };

  walk(menus);
  return result;
}

function normalizeRoutePath(path: string) {
  return path.replace(/^\/+/, "");
}

export function buildDynamicRoutes(menus: DbMenu[]): RouteObject[] {
  const pageMenus = flattenMenus(menus).filter((item) => item.status === 1 && item.menuType === 1);

  const routes: RouteObject[] = pageMenus.map((menu) => {
    const Component = resolvePageComponent(menu.component);

    return {
      path: normalizeRoutePath(menu.path),
      element: (
        <Suspense fallback={<ConsoleLayoutLoading />}>
          <Component />
        </Suspense>
      ),
      handle: {
        title: menu.menuName,
        permission: menu.permission,
        menuId: menu.id,
      },
      errorElement: <NotFound />,
    };
  });

  routes.push({
    path: "*",
    element: <NotFound />,
  });

  return routes;
}
