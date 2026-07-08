import { lazy, Suspense } from "react";
import { AppLoading } from "@/components/AppLoading";
import { AppMainLoading } from "@/components/AppMainLoading";
import { lazyWithMinimumDelay } from "@/utils/lazyWithMinimumDelay";

const Login = lazyWithMinimumDelay(() => import("@/pages/Login"), 500);
const Dashboard = lazy(() => import("@/pages/Dashboard"));

const LoginLoading = () => <AppLoading text="正在加载页面中..." />;

export const LoginRoute = () => (
  <Suspense fallback={<LoginLoading />}>
    <Login />
  </Suspense>
);

export const DashboardRoute = () => (
  <Suspense fallback={<AppMainLoading text="正在加载中..." />}>
    <Dashboard />
  </Suspense>
);
