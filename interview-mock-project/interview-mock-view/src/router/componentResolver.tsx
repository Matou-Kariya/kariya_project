import { lazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";
import NotFound from "@/pages/Error/NotFound";

type PageComponent = ComponentType<any> | LazyExoticComponent<ComponentType<any>>;

const pageModules = import.meta.glob("/src/pages/**/index.tsx");

function normalizeComponent(component?: string | null) {
  if (!component) return "";

  return component.replace(/^\/+/, "").replace(/\/index$/, "");
}

function upperFirstPath(path: string) {
  return path
    .split("/")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join("/");
}

export function resolvePageComponent(component?: string | null): PageComponent {
  const normalized = normalizeComponent(component);

  if (!normalized) {
    return NotFound;
  }

  const candidates = [`/src/pages/${normalized}/index.tsx`, `/src/pages/${upperFirstPath(normalized)}/index.tsx`];

  const matchedPath = candidates.find((path) => path in pageModules);

  if (!matchedPath) {
    console.warn(`[router] 页面组件不存在: ${component}`);
    return NotFound;
  }

  return lazy(pageModules[matchedPath] as any);
}
