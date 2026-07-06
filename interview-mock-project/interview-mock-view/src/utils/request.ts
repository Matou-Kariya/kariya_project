import axios from "axios";
import { message } from "antd";

const request = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

// 请求拦截器：添加 Token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器：统一错误处理
request.interceptors.response.use(
  (response) => {
    const { data } = response;
    // 假设后端统一返回 { code: 0, data: ..., message: ... }
    if (data.code === 0) {
      return data.data;
    }
    // 登录过期
    if (data.code === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      window.location.href = "/login";
      message.error("登录已过期，请重新登录");
      return Promise.reject(new Error(data.message));
    }
    message.error(data.message || "请求失败");
    return Promise.reject(new Error(data.message));
  },
  (error) => {
    message.error(error.message || "网络错误");
    return Promise.reject(error);
  },
);

export default request;
