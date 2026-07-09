import { Layout, Menu } from "antd";
import { DashboardOutlined, SettingOutlined, RobotOutlined, QuestionCircleOutlined, PlayCircleFilled } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
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

function findMenuPathKeys(menus: DbMenu[], pathname: string): string[] {
  for (const menu of menus) {
    const key = getMenuKey(menu);

    if (key === pathname) return [key];

    if (menu.children?.length) {
      const childKeys = findMenuPathKeys(menu.children, pathname);
      if (childKeys.length) return [key, ...childKeys];
    }
  }

  return [];
}

type SidebarProps = {
  collapsed: boolean;
};

export function Sidebar({ collapsed }: SidebarProps) {
  const menus = useSelector((state: RootState) => state.user.menus);
  const menuItems = useMemo(() => toMenuItems(menus), [menus]);
  const location = useLocation();
  const navigate = useNavigate();

  const matchedKeys = useMemo(() => findMenuPathKeys(menus, location.pathname), [menus, location.pathname]);

  const selectedKeys = matchedKeys.length ? [matchedKeys[matchedKeys.length - 1]] : [location.pathname];

  const parentOpenKeys = matchedKeys.slice(0, -1);
  const [openKeys, setOpenKeys] = useState<string[]>(parentOpenKeys);

  useEffect(() => {
    if (!collapsed) {
      setOpenKeys(parentOpenKeys);
    }
  }, [collapsed, parentOpenKeys.join("|")]);

  const helpItems: MenuProps["items"] = [
    {
      key: "/help",
      label: "帮助中心",
      icon: <QuestionCircleOutlined />,
    },
  ];

  return (
    <Sider width={248} collapsedWidth={82} collapsed={collapsed} className="sidebar">
      <div className="sidebar__inner">
        <div className="sidebar__brand">
          <div className="sidebar__brand-mark">K</div>

          {!collapsed && (
            <div>
              <div className="sidebar__brand-title">Kariya-Admin</div>
              <div className="sidebar__brand-subtitle">后台管理系统</div>
            </div>
          )}
        </div>

        <div className="sidebar__divider">{!collapsed ? <span>MAIN MENU</span> : <i />}</div>

        <Menu
          mode={collapsed ? "vertical" : "inline"}
          triggerSubMenuAction="hover"
          selectedKeys={selectedKeys}
          openKeys={collapsed ? undefined : openKeys}
          items={menuItems}
          popupClassName="sidebar__popup"
          onOpenChange={(keys) => setOpenKeys(keys as string[])}
          onClick={({ key }) => navigate(String(key))}
          className="sidebar__menu"
        />

        <div className="sidebar__bottom">
          <div className="sidebar__divider sidebar__divider--others">{!collapsed ? <span>OTHERS</span> : <i />}</div>

          <Menu
            mode={collapsed ? "vertical" : "inline"}
            selectedKeys={location.pathname === "/help" ? ["/help"] : []}
            items={helpItems}
            onClick={({ key }) => navigate(String(key))}
            className="sidebar__menu sidebar__menu--others"
          />

          {!collapsed && (
            <div className="sidebar__help-card">
              <div className="sidebar__help-title">Need guidance?</div>
              <p>查看使用说明，快速了解后台常用功能。</p>
              <button type="button">
                <PlayCircleFilled />
                Watch Now
              </button>
            </div>
          )}
        </div>
      </div>
    </Sider>
  );
}
