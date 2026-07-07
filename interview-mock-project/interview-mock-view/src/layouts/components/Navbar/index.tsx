import { Avatar, Breadcrumb, Button, Dropdown } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import type { MenuProps } from "antd";
import type { RootState } from "@/store";
import { logout } from "@/store/slices/userSlice";
import type { DbMenu } from "@/types/menu";
import "./index.css";

type NavbarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

function findMenuName(menus: DbMenu[], pathname: string): string | undefined {
  for (const menu of menus) {
    const path = menu.path.startsWith("/") ? menu.path : `/${menu.path}`;

    if (path === pathname) return menu.menuName;

    if (menu.children?.length) {
      const name = findMenuName(menu.children, pathname);
      if (name) return name;
    }
  }
}

export function Navbar({ collapsed, onToggle }: NavbarProps) {
  const menus = useSelector((state: RootState) => state.user.menus);
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userMenuItems: MenuProps["items"] = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
      onClick: () => {
        dispatch(logout());
        navigate("/login", { replace: true });
      },
    },
  ];

  return (
    <header className="navbar">
      <div className="navbar__left">
        <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={onToggle} />

        <Breadcrumb items={[{ title: "首页" }, { title: findMenuName(menus, location.pathname) || "仪表盘" }]} />
      </div>

      <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
        <div className="navbar__user">
          <Avatar icon={<UserOutlined />} />
          <span>{userInfo?.username || "Admin"}</span>
        </div>
      </Dropdown>
    </header>
  );
}
