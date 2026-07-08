import axios from "axios";
import request, { type Result } from "@/utils/request";

export type LoginParams = {
  username: string;
  password: string;
  rememberMe: boolean;
};

export type UserInfo = {
  userId: number;
  username: string;
  roles: string[];
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  userInfo: UserInfo;
};

export function loginApi(data: LoginParams) {
  return axios.post<Result<LoginResponse>>("/api/auth/login", data).then((response) => {
    const result = response.data;

    if (result.code === 0) {
      return result.data;
    }

    return Promise.reject(new Error(result.message || "登录失败"));
  });
}

export function refreshTokenApi() {
  return request.post<LoginResponse, LoginResponse>("/auth/refresh");
}

export function getCurrentUserApi() {
  return request.get<UserInfo, UserInfo>("/auth/me");
}

export function logoutApi(accessToken: string, refreshToken: string) {
  return request.post("/auth/logout", { accessToken, refreshToken });
}
