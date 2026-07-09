import { Suspense } from "react";
import type { RouteObject } from "react-router-dom";
import { resolvePageComponent } from "./componentResolver";
import { AppMainLoading } from "@/components/AppMainLoading";
import type { DbMenu } from "@/types/menu";

function flattenMenus(menus: DbMenu[]) {
  const result: DbMenu[] = [];

  const walk = (items: DbMenu[]) => {
    items.forEach((item) => {
      result.push(item);

      if (item.children?.length) {
        walk(item.children);
      }
    });
  };

  walk(menus);
  return result;
}

function normalizeRoutePath(path: string) {
  return path.replace(/^\/+/, "");
}

export function buildDynamicRoutes(menus: DbMenu[]): RouteObject[] {
  return flattenMenus(menus)
    .filter((item) => item.status === 1 && item.menuType === 1)
    .map((menu) => {
      const Component = resolvePageComponent(menu.component);

      return {
        path: normalizeRoutePath(menu.path),
        element: (
          <Suspense fallback={<AppMainLoading text="正在加载页面" />}>
            <Component />
          </Suspense>
        ),
        handle: {
          title: menu.menuName,
          permission: menu.permission,
          menuId: menu.id,
        },
      };
    });
}
