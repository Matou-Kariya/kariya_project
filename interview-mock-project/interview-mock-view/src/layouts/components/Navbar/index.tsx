import { Avatar, Breadcrumb, Button, Dropdown, Input } from "antd";
import { BellOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import type { MenuProps } from "antd";
import type { RootState } from "@/store";
import { logoutApi } from "@/api/auth";
import { clearAuthTokens } from "@/utils/authStorage";
import { logout } from "@/store/slices/userSlice";
import type { DbMenu } from "@/types/menu";
import "./index.css";

type NavbarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function findMenuChain(menus: DbMenu[], pathname: string): DbMenu[] {
  for (const menu of menus) {
    const path = normalizePath(menu.path);

    if (path === pathname) {
      return [menu];
    }

    if (menu.children?.length) {
      const childChain = findMenuChain(menu.children, pathname);

      if (childChain.length) {
        return [menu, ...childChain];
      }
    }
  }

  return [];
}

export function Navbar({ collapsed, onToggle }: NavbarProps) {
  const menus = useSelector((state: RootState) => state.user.menus);
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const menuChain = findMenuChain(menus, location.pathname);

  const breadcrumbItems = [
    {
      title: (
        <span className="navbar__breadcrumb-link" onClick={() => navigate("/dashboard")}>
          首页
        </span>
      ),
    },
    ...menuChain.map((menu, index) => {
      const isLast = index === menuChain.length - 1;
      const path = normalizePath(menu.path);
      const clickable = isLast && menu.menuType === 1;

      return {
        title: clickable ? (
          <span className="navbar__breadcrumb-current">{menu.menuName}</span>
        ) : (
          <span className={isLast ? "navbar__breadcrumb-current" : "navbar__breadcrumb-parent"}>{menu.menuName}</span>
        ),
        onClick: undefined,
        key: path,
      };
    }),
  ];

  const handleLogout = async () => {
    try {
      await logoutApi();
    } finally {
      clearAuthTokens();
      dispatch(logout());
      navigate("/login", { replace: true });
    }
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
      onClick: handleLogout,
    },
  ];

  return (
    <header className="navbar">
      <div className="navbar__left">
        <Button className="navbar__toggle" type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={onToggle} />

        <Breadcrumb className="navbar__breadcrumb" items={breadcrumbItems} />
      </div>

      <div className="navbar__right">
        <Button className="navbar__icon" shape="circle" icon={<BellOutlined />} />

        <Input className="navbar__search" prefix={<SearchOutlined />} placeholder="搜索菜单、功能或关键词" allowClear />

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <div className="navbar__user">
            <Avatar className="navbar__avatar" icon={<UserOutlined />} />
            <span>{userInfo?.username || "Admin"}</span>
          </div>
        </Dropdown>
      </div>
    </header>
  );
}
