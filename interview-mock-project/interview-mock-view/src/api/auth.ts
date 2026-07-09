import request from "@/utils/request";

export type LoginParams = {
  username: string;
  password: string;
  rememberMe: boolean;
  deviceId?: string;
};

export type UserInfo = {
  userId: number;
  username: string;
  roles: string[];
  permissions: string[];
};

export type LoginResponse = {
  accessToken: string;
  expiresIn: number;
  userInfo: UserInfo;
};

export function loginApi(data: LoginParams) {
  return request.post<LoginResponse, LoginResponse>("/auth/login", data);
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
