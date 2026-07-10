export type MenuType = 0 | 1 | 2;
// 0 目录，1 菜单页面，2 按钮权限

export type DbMenu = {
  id: number;
  parentId: number;
  menuName: string;
  path: string;
  component?: string | null;
  icon?: string | null;
  menuType: MenuType;
  permission?: string | null;
  orderNum: number;
  status: 0 | 1;
  createTime?: string | null;
  updateTime?: string | null;
  children?: DbMenu[];
};
