import request from "@/utils/request";
import type { DbMenu } from "@/types/menu";

export function getUserMenusApi() {
  return request.get<DbMenu[], DbMenu[]>("/system/menu/user");
}
