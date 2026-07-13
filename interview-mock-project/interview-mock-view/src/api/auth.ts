import request from "@/utils/request";
import type { LoginResponse, UserInfo } from "@/types/auth";

export type LoginParams = {
  username: string;
  password: string;
  rememberMe: boolean;
  deviceId?: string;
};

export type { LoginResponse, UserInfo } from "@/types/auth";

export function loginApi(data: LoginParams) {
  return request.post<LoginResponse, LoginResponse>("/auth/login", data, {
    silentError: true,
    skipAuthRefresh: true,
  });
}

export function refreshTokenApi() {
  return request.post<LoginResponse, LoginResponse>("/auth/refresh");
}

export function getCurrentUserApi() {
  return request.get<UserInfo, UserInfo>("/auth/me");
}

export function logoutApi() {
  return request.post<void, void>("/auth/logout");
}
