import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Layout, Menu, Button, Dropdown, Avatar } from "antd";
import { DashboardOutlined, TeamOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slices/userSlice";
import "./index.css";

const { Header, Sider, Content } = Layout;

// 菜单配置（后续可改为动态从后端获取）
const menuItems: MenuProps["items"] = [
  {
    key: "/dashboard",
    icon: <DashboardOutlined />,
    label: "仪表盘",
  },
  {
    key: "/system",
    icon: <TeamOutlined />,
    label: "系统管理",
    children: [
      { key: "/system/user", label: "用户管理" },
      { key: "/system/role", label: "角色管理" },
    ],
  },
];

export const BasicLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const userMenuItems: MenuProps["items"] = [
    { key: "profile", icon: <UserOutlined />, label: "个人中心" },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo">AI 面试官</div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={["/dashboard"]} items={menuItems} onClick={handleMenuClick} />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, width: 64, height: 64 }}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Avatar icon={<UserOutlined />} style={{ marginRight: 24, cursor: "pointer" }} />
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: "#fff",
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
