import { Layout, Menu } from "antd";
import { DashboardOutlined, SettingOutlined, RobotOutlined } from "@ant-design/icons";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { MenuProps } from "antd";
import type { RootState } from "@/store";
import type { DbMenu } from "@/types/menu";
import "./index.css";

const { Sider } = Layout;

const iconMap = {
  DashboardOutlined: <DashboardOutlined />,
  SettingOutlined: <SettingOutlined />,
  RobotOutlined: <RobotOutlined />,
};

function getMenuKey(menu: DbMenu) {
  return menu.path.startsWith("/") ? menu.path : `/${menu.path}`;
}

function toMenuItems(menus: DbMenu[]): MenuProps["items"] {
  return menus
    .filter((item) => item.status === 1 && item.menuType !== 2)
    .sort((a, b) => a.orderNum - b.orderNum)
    .map((item) => ({
      key: getMenuKey(item),
      label: item.menuName,
      icon: item.icon ? iconMap[item.icon as keyof typeof iconMap] : undefined,
      children: item.children?.length ? toMenuItems(item.children) : undefined,
    }));
}

type SidebarProps = {
  collapsed: boolean;
};

export function Sidebar({ collapsed }: SidebarProps) {
  const menus = useSelector((state: RootState) => state.user.menus);
  const menuItems = useMemo(() => toMenuItems(menus), [menus]);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sider width={224} collapsed={collapsed} className="sidebar">
      <div className="sidebar__logo">{collapsed ? "AI" : "AI 面试官"}</div>

      <Menu mode="inline" selectedKeys={[location.pathname]} items={menuItems} onClick={({ key }) => navigate(String(key))} className="sidebar__menu" />
    </Sider>
  );
}
