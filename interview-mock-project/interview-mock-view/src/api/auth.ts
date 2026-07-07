import request from "@/utils/request";

export type LoginParams = {
  username: string;
  password: string;
  rememberMe: boolean;
};

export type UserInfo = {
  userId: number;
  username: string;
  role: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  userInfo: UserInfo;
};

export function loginApi(data: LoginParams) {
  return request.post<LoginResponse, LoginResponse>("/auth/login", data);
}

export function refreshTokenApi(refreshToken: string) {
  return request.post("/auth/refresh", { refreshToken });
}

export function logoutApi(accessToken: string, refreshToken: string) {
  return request.post("/auth/logout", { accessToken, refreshToken });
}
