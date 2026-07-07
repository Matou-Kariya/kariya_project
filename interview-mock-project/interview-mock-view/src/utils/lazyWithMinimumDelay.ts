import { lazy } from "react";

export function lazyWithMinimumDelay<T extends React.ComponentType<unknown>>(loader: () => Promise<{ default: T }>, minDuration = 2500) {
  return lazy(async () => {
    const [module] = await Promise.all([loader(), new Promise((resolve) => window.setTimeout(resolve, minDuration))]);

    return module;
  });
}
