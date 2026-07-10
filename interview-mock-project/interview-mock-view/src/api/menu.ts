import request from "@/utils/request";
import type { DbMenu } from "@/types/menu";

export type MenuPayload = {
  parentId: number;
  menuName: string;
  path?: string;
  component?: string;
  icon?: string;
  menuType: 0 | 1 | 2;
  permission?: string;
  orderNum: number;
  status: 0 | 1;
};

export function getUserMenusApi() {
  return request.get<DbMenu[], DbMenu[]>("/system/menu/user");
}

export function getMenuListApi() {
  return request.get<DbMenu[], DbMenu[]>("/system/menu/list");
}

export function createMenuApi(data: MenuPayload) {
  return request.post<number, number>("/system/menu", data);
}

export function updateMenuApi(id: number, data: MenuPayload) {
  return request.put<void, void>(`/system/menu/${id}`, data);
}

export function deleteMenuApi(id: number) {
  return request.delete<void, void>(`/system/menu/${id}`);
}
