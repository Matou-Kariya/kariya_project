import { lazy, Suspense } from "react";
import { AppLoading } from "@/components/AppLoading";
import { LayoutLoading } from "@/components/LayoutLoading";
import { lazyWithMinimumDelay } from "@/utils/lazyWithMinimumDelay";

const Login = lazyWithMinimumDelay(() => import("@/pages/Login"), 500);
const Dashboard = lazy(() => import("@/pages/Dashboard"));

const Loading = () => <AppLoading text="正在加载页面中..." />;
const DashboardLoading = () => <LayoutLoading text="正在加载页面" variant="content" />;

export const LoginRoute = () => (
  <Suspense fallback={<Loading />}>
    <Login />
  </Suspense>
);

export const DashboardRoute = () => (
  <Suspense fallback={<DashboardLoading />}>
    <Dashboard />
  </Suspense>
);
