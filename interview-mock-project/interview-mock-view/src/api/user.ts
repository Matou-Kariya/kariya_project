import request from "@/utils/request";
import type { PageResult } from "@/types/page";

export type RoleOption = {
  id: number;
  roleName: string;
  roleKey: string;
};

export type UserRecord = {
  id: number;
  username: string;
  nickname?: string | null;
  avatar?: string | null;
  email?: string | null;
  phone?: string | null;
  status: 0 | 1;
  createTime?: string | null;
  updateTime?: string | null;
  roles: RoleOption[];
};

export type UserQuery = {
  current: number;
  size: number;
  username?: string;
  nickname?: string;
  status?: 0 | 1;
};

export type UserPayload = {
  username: string;
  password?: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  status: 0 | 1;
  roleIds: number[];
};

export function getUserPageApi(params: UserQuery) {
  return request.get<PageResult<UserRecord>, PageResult<UserRecord>>("/system/user/page", { params });
}

export function createUserApi(data: UserPayload) {
  return request.post<number, number>("/system/user", data);
}

export function updateUserApi(id: number, data: UserPayload) {
  return request.put<void, void>(`/system/user/${id}`, data);
}

export function deleteUserApi(id: number) {
  return request.delete<void, void>(`/system/user/${id}`);
}
