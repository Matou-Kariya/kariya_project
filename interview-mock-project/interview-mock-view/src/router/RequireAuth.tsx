import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { getUserMenusApi } from "@/api/menu";
import { getCurrentUserApi, refreshTokenApi } from "@/api/auth";
import { clearAuthTokens, getAccessToken, getRefreshToken, getUserInfo, saveAuthTokens, saveUserInfo } from "@/utils/authStorage";
import { setMenus, setToken, setUserInfo } from "@/store/slices/userSlice";
import { LayoutLoading } from "@/components/LayoutLoading";

type RequireAuthProps = {
  children: React.ReactNode;
  loading?: React.ReactNode;
};

export const RequireAuth = ({ children, loading }: RequireAuthProps) => {
  const dispatch = useDispatch();
  const location = useLocation();

  const reduxToken = useSelector((state: RootState) => state.user.token);
  const menus = useSelector((state: RootState) => state.user.menus);
  const userInfo = useSelector((state: RootState) => state.user.userInfo);

  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let ignore = false;

    const initAuth = async () => {
      try {
        let token = reduxToken || getAccessToken();

        if (!token) {
          const refreshToken = getRefreshToken();

          if (!refreshToken) {
            throw new Error("No token");
          }

          const refreshed = await refreshTokenApi(refreshToken);
          saveAuthTokens(refreshed.accessToken, refreshed.refreshToken, true);

          token = refreshed.accessToken;

          dispatch(setToken(refreshed.accessToken));
          dispatch(setUserInfo(refreshed.userInfo));
          saveUserInfo(refreshed.userInfo);
        } else if (!reduxToken) {
          dispatch(setToken(token));
        }

        if (!userInfo) {
          try {
            const currentUser = await getCurrentUserApi();
            dispatch(setUserInfo(currentUser));
            saveUserInfo(currentUser);
          } catch {
            const cachedUser = getUserInfo();

            if (cachedUser) {
              dispatch(setUserInfo(cachedUser));
            }
          }
        }

        if (!menus.length) {
          const userMenus = await getUserMenusApi();
          dispatch(setMenus(userMenus));
        }

        if (!ignore) {
          setAuthorized(true);
        }
      } catch {
        clearAuthTokens();

        if (!ignore) {
          setAuthorized(false);
        }
      } finally {
        if (!ignore) {
          setChecking(false);
        }
      }
    };

    initAuth();

    return () => {
      ignore = true;
    };
  }, [dispatch, reduxToken, menus.length, userInfo]);

  if (checking) {
    return loading ?? <LayoutLoading text="正在恢复工作台" variant="page" />;
  }

  if (!authorized) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
