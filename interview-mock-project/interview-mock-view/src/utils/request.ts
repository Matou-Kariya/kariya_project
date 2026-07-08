import axios from "axios";
import { message } from "@/services/antd";
import { getAccessToken, clearAuthTokens } from "./authStorage";

export type Result<T> = {
  code: number;
  message: string;
  data: T;
};
let unauthorizedHandled = false;

function handleUnauthorized() {
  if (unauthorizedHandled) return;

  unauthorizedHandled = true;

  clearAuthTokens();

  message.warning("登录已过期，请重新登录");

  setTimeout(() => {
    window.location.href = "/login";
  }, 800);
}

const request = axios.create({
  baseURL: "/api",
  timeout: 10000,
  withCredentials: true,
});

// 请求拦截器：添加 Token
request.interceptors.request.use(
  (config) => {
    const publicUrls = ["/auth/login", "/auth/refresh"];
    const isPublicRequest = publicUrls.some((url) => config.url?.includes(url));
    if (!isPublicRequest) {
      const accessToken = getAccessToken();

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器：统一错误处理
request.interceptors.response.use(
  (response) => {
    const contentType = String(response.headers["content-type"] || "");

    if (response.config.responseType === "blob" || response.config.responseType === "arraybuffer" || contentType.includes("application/octet-stream")) {
      return response.data;
    }

    const result = response.data as Result<unknown>;

    if (result.code === 0) {
      return result.data;
    }

    if (result.code === 401) {
      handleUnauthorized();
      return Promise.reject(new Error(result.message || "登录已过期"));
    }

    message.error(result.message || "请求失败");
    return Promise.reject(new Error(result.message || "请求失败"));
  },
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      handleUnauthorized();
      return Promise.reject(error);
    }

    message.error(error.message || "网络错误");
    return Promise.reject(error);
  },
);

export default request;
