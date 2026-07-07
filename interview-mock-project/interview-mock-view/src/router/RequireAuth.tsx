import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const token = useSelector((state: RootState) => state.user.token);
  const location = useLocation();

  if (!token) {
    // 跳转到登录页，并带上当前页面路径以便登录后跳回
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
