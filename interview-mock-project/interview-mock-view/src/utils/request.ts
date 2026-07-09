import axios from "axios";
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { message } from "@/services/antd";
import { clearAuthTokens, getAccessToken, saveAccessToken, saveUserInfo } from "./authStorage";

export type Result<T> = {
  code: number;
  message: string;
  data: T;
};

type LoginResponse = {
  accessToken: string;
  expiresIn: number;
  userInfo?: any;
};

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let unauthorizedHandled = false;
let refreshPromise: Promise<LoginResponse> | null = null;

const request = axios.create({
  baseURL: "/api",
  timeout: 10000,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
  withCredentials: true,
});

function isPublicAuthUrl(url?: string) {
  return Boolean(url?.includes("/auth/login") || url?.includes("/auth/refresh"));
}

function handleUnauthorized() {
  if (unauthorizedHandled) return;

  unauthorizedHandled = true;
  clearAuthTokens();

  message.warning("登录已过期，请重新登录");

  setTimeout(() => {
    window.location.href = "/login";
  }, 800);
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

        if (result.data.userInfo) {
          saveUserInfo(result.data.userInfo);
        }

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
    return result.data;
  }

  if (result.code === 401) {
    if (!config._retry && !isPublicAuthUrl(config.url)) {
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

    handleUnauthorized();
    return Promise.reject(new Error(result.message || "登录已过期"));
  }

  message.error(result.message || "请求失败");
  return Promise.reject(new Error(result.message || "请求失败"));
}

async function handleError(error: AxiosError) {
  const status = error.response?.status;
  const config = error.config as RetryConfig | undefined;

  if (status === 401) {
    if (config && !config._retry && !isPublicAuthUrl(config.url)) {
      try {
        config._retry = true;

        const refreshed = await refreshAccessToken();
        config.headers.Authorization = `Bearer ${refreshed.accessToken}`;

        return request(config);
      } catch {
        handleUnauthorized();
        return Promise.reject(error);
      }
    }

    handleUnauthorized();
    return Promise.reject(error);
  }

  message.error(error.message || "网络错误");
  return Promise.reject(error);
}

request.interceptors.response.use(handleResponse as any, handleError);

export default request;
