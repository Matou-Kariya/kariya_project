import axios from "axios";
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { message } from "@/services/antd";
import { store } from "@/store";
import { logout, setToken, setUserInfo } from "@/store/slices/userSlice";
import type { LoginResponse } from "@/types/auth";
import { clearAuthTokens, getAccessToken, saveAccessToken, saveUserInfo } from "./authStorage";

export type Result<T> = {
  code: number;
  error?: string | null;
  message: string;
  data: T;
};

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let unauthorizedHandled = false;
let refreshPromise: Promise<LoginResponse> | null = null;

const request = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

function isPublicAuthUrl(url?: string) {
  return url === "/auth/login" || url === "/auth/refresh";
}

function toResult(error: AxiosError) {
  return error.response?.data as Result<unknown> | undefined;
}

function handleUnauthorized() {
  if (unauthorizedHandled) return;

  unauthorizedHandled = true;
  clearAuthTokens();
  store.dispatch(logout());

  message.warning("登录已失效，请重新登录");

  setTimeout(() => {
    window.location.href = "/login";
  }, 500);
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<Result<LoginResponse>>("/auth/refresh")
      .then((response) => {
        const result = response.data;

        if (result.code !== 0) {
          throw new Error(result.message || "刷新登录态失败");
        }

        saveAccessToken(result.data.accessToken);
        saveUserInfo(result.data.userInfo);
        store.dispatch(setToken(result.data.accessToken));
        store.dispatch(setUserInfo(result.data.userInfo));

        return result.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

request.interceptors.request.use((config) => {
  if (!isPublicAuthUrl(config.url)) {
    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  return config;
});

async function handleResponse(response: AxiosResponse<Result<unknown>>) {
  const result = response.data;
  const config = response.config as RetryConfig;

  if (result.code === 0) {
    if (config.url === "/auth/login") unauthorizedHandled = false;
    return result.data;
  }

  if (
    result.error === "TOKEN_EXPIRED" &&
    !config._retry &&
    !config.skipAuthRefresh &&
    !isPublicAuthUrl(config.url)
  ) {
    try {
      config._retry = true;
      const refreshed = await refreshAccessToken();
      config.headers.Authorization = `Bearer ${refreshed.accessToken}`;
      return request(config);
    } catch {
      handleUnauthorized();
      return Promise.reject(new Error("登录已过期"));
    }
  }

  if (result.code === 401 || result.error === "TOKEN_INVALID" || result.error === "REFRESH_TOKEN_INVALID") {
    if (!isPublicAuthUrl(config.url)) handleUnauthorized();
    return Promise.reject(new Error(result.message || "登录已失效"));
  }

  if (!config.silentError) message.error(result.message || "请求失败");
  return Promise.reject(new Error(result.message || "请求失败"));
}

async function handleError(error: AxiosError) {
  const config = error.config as RetryConfig | undefined;
  const result = toResult(error);

  if (error.response?.status === 401 && config) {
    if (
      result?.error === "TOKEN_EXPIRED" &&
      !config._retry &&
      !config.skipAuthRefresh &&
      !isPublicAuthUrl(config.url)
    ) {
      try {
        config._retry = true;
        const refreshed = await refreshAccessToken();
        config.headers.Authorization = `Bearer ${refreshed.accessToken}`;
        return request(config);
      } catch {
        handleUnauthorized();
        return Promise.reject(new Error(result?.message || "登录已过期"));
      }
    }

    if (!isPublicAuthUrl(config.url)) handleUnauthorized();
    return Promise.reject(new Error(result?.message || error.message || "登录失败"));
  }

  if (!config?.silentError) message.error(result?.message || error.message || "网络错误");
  return Promise.reject(new Error(result?.message || error.message || "网络错误"));
}

request.interceptors.response.use(
  handleResponse as unknown as (response: AxiosResponse) => AxiosResponse,
  handleError,
);

export default request;
