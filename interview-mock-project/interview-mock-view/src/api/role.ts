import request from "@/utils/request";
import type { PageResult } from "@/types/page";
import type { RoleOption, UserRecord } from "./user";

export type RoleRecord = {
  id: number;
  roleName: string;
  roleKey: string;
  status: 0 | 1;
  userCount: number;
  createTime?: string | null;
  updateTime?: string | null;
};

export type RoleQuery = {
  current: number;
  size: number;
  roleName?: string;
  roleKey?: string;
  status?: 0 | 1;
};

export type RolePayload = {
  roleName: string;
  roleKey: string;
  status: 0 | 1;
};

export type RoleUserQuery = {
  current: number;
  size: number;
  username?: string;
  nickname?: string;
};

export function getRolePageApi(params: RoleQuery) {
  return request.get<PageResult<RoleRecord>, PageResult<RoleRecord>>("/system/role/page", { params });
}

export function getRoleOptionsApi() {
  return request.get<RoleOption[], RoleOption[]>("/system/role/options");
}

export function createRoleApi(data: RolePayload) {
  return request.post<number, number>("/system/role", data);
}

export function updateRoleApi(id: number, data: RolePayload) {
  return request.put<void, void>(`/system/role/${id}`, data);
}

export function deleteRoleApi(id: number) {
  return request.delete<void, void>(`/system/role/${id}`);
}

export function getRoleUsersApi(roleId: number, params: RoleUserQuery) {
  return request.get<PageResult<UserRecord>, PageResult<UserRecord>>(`/system/role/${roleId}/users`, { params });
}

export function getAvailableRoleUsersApi(roleId: number, params: RoleUserQuery) {
  return request.get<PageResult<UserRecord>, PageResult<UserRecord>>(`/system/role/${roleId}/available-users`, { params });
}

export function addUsersToRoleApi(roleId: number, ids: number[]) {
  return request.post<void, void>(`/system/role/${roleId}/users`, { ids });
}

export function removeUserFromRoleApi(roleId: number, userId: number) {
  return request.delete<void, void>(`/system/role/${roleId}/users/${userId}`);
}

export function getRoleMenuIdsApi(roleId: number) {
  return request.get<number[], number[]>(`/system/role/${roleId}/menus`);
}

export function updateRoleMenusApi(roleId: number, ids: number[]) {
  return request.put<void, void>(`/system/role/${roleId}/menus`, { ids });
}
