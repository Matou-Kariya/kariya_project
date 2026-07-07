import { lazy, Suspense } from "react";
import { Spin } from "antd";

const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));

const Loading = () => <Spin size="large" style={{ display: "block", margin: "20% auto" }} />;

export const LoginRoute = () => (
  <Suspense fallback={<Loading />}>
    <Login />
  </Suspense>
);

export const DashboardRoute = () => (
  <Suspense fallback={<Loading />}>
    <Dashboard />
  </Suspense>
);
