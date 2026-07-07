import { lazy } from "react";
import type { ComponentType } from "react";

const pageModules = import.meta.glob("/src/pages/**/index.tsx");

export function loadPageComponent(component?: string | null) {
  if (!component) return null;

  const key = `/src/pages/${component}/index.tsx`;
  const loader = pageModules[key];

  if (!loader) {
    console.warn(`未找到页面组件: ${key}`);
    return null;
  }

  return lazy(loader as () => Promise<{ default: ComponentType }>);
}
