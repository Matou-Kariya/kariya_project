import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getUserMenusApi } from "@/api/menu";
import { getCurrentUserApi, refreshTokenApi } from "@/api/auth";
import { clearAuthTokens, getAccessToken, getUserInfo, saveAccessToken, saveUserInfo } from "@/utils/authStorage";
import { setMenus, setToken, setUserInfo } from "@/store/slices/userSlice";
import { ConsoleLayoutLoading } from "@/components/ConsoleLayoutLoading";
import type { DbMenu } from "@/types/menu";
import type { UserInfo } from "@/api/auth";

type RequireAuthProps = {
  children: React.ReactNode;
  loading?: React.ReactNode;
};

type AuthBootstrapResult = {
  token: string;
  userInfo: UserInfo;
  menus: DbMenu[];
};

let authBootstrapPromise: Promise<AuthBootstrapResult> | null = null;

function bootstrapAuth() {
  if (!authBootstrapPromise) {
    authBootstrapPromise = doBootstrapAuth().finally(() => {
      authBootstrapPromise = null;
    });
  }

  return authBootstrapPromise;
}

async function doBootstrapAuth(): Promise<AuthBootstrapResult> {
  let token = getAccessToken();
  let userInfo = getUserInfo<UserInfo>();

  if (!token) {
    const refreshed = await refreshTokenApi();

    token = refreshed.accessToken;
    userInfo = refreshed.userInfo;

    saveAccessToken(refreshed.accessToken);
    saveUserInfo(refreshed.userInfo);
  }

  if (!userInfo) {
    userInfo = await getCurrentUserApi();
    saveUserInfo(userInfo);
  }

  const menus = await getUserMenusApi();

  return {
    token,
    userInfo,
    menus,
  };
}

export const RequireAuth = ({ children, loading }: RequireAuthProps) => {
  const dispatch = useDispatch();
  const location = useLocation();

  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;

    bootstrapAuth()
      .then(({ token, userInfo, menus }) => {
        if (cancelled) return;

        dispatch(setToken(token));
        dispatch(setUserInfo(userInfo));
        dispatch(setMenus(menus));

        setAuthorized(true);
      })
      .catch(() => {
        if (cancelled) return;

        clearAuthTokens();
        setAuthorized(false);
      })
      .finally(() => {
        if (cancelled) return;

        setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  if (checking) {
    return loading ?? <ConsoleLayoutLoading />;
  }

  if (!authorized) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
