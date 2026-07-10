import {
  AppstoreOutlined,
  DashboardOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  MenuOutlined,
  QuestionCircleOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";

const menuIconComponents = {
  DashboardOutlined,
  SettingOutlined,
  RobotOutlined,
  MenuOutlined,
  UserOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  AppstoreOutlined,
  FolderOpenOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  VideoCameraOutlined,
};

export type MenuIconName = keyof typeof menuIconComponents;

export const menuIconOptions: Array<{ label: string; value: MenuIconName }> = [
  { label: "仪表盘", value: "DashboardOutlined" },
  { label: "系统设置", value: "SettingOutlined" },
  { label: "机器人", value: "RobotOutlined" },
  { label: "菜单", value: "MenuOutlined" },
  { label: "用户", value: "UserOutlined" },
  { label: "团队", value: "TeamOutlined" },
  { label: "安全权限", value: "SafetyCertificateOutlined" },
  { label: "应用模块", value: "AppstoreOutlined" },
  { label: "文件夹", value: "FolderOpenOutlined" },
  { label: "文档", value: "FileTextOutlined" },
  { label: "问题", value: "QuestionCircleOutlined" },
  { label: "视频", value: "VideoCameraOutlined" },
];

export function getMenuIcon(name?: string | null) {
  if (!name || !(name in menuIconComponents)) {
    return undefined;
  }

  const Icon = menuIconComponents[name as MenuIconName];
  return <Icon />;
}
