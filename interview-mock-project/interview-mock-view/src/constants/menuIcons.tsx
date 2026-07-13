import type { ComponentType } from "react";
import {
  AccountBookOutlined,
  ApiOutlined,
  ApartmentOutlined,
  AppstoreOutlined,
  AreaChartOutlined,
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  AudioOutlined,
  AuditOutlined,
  BarChartOutlined,
  BellOutlined,
  BookOutlined,
  BranchesOutlined,
  BugOutlined,
  CalendarOutlined,
  CarryOutOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  CloudServerOutlined,
  ClusterOutlined,
  CodeOutlined,
  CommentOutlined,
  CompressOutlined,
  ContactsOutlined,
  ControlOutlined,
  CopyOutlined,
  CreditCardOutlined,
  CrownOutlined,
  CustomerServiceOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  DeploymentUnitOutlined,
  DesktopOutlined,
  DotChartOutlined,
  DownloadOutlined,
  DragOutlined,
  EditOutlined,
  EllipsisOutlined,
  EnterOutlined,
  ExpandOutlined,
  EyeOutlined,
  FileOutlined,
  FileTextOutlined,
  FilterOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  FormOutlined,
  FundOutlined,
  GiftOutlined,
  GlobalOutlined,
  HomeOutlined,
  IdcardOutlined,
  InboxOutlined,
  InfoCircleOutlined,
  KeyOutlined,
  LeftOutlined,
  LineChartOutlined,
  LinkOutlined,
  LockOutlined,
  LoginOutlined,
  LogoutOutlined,
  MailOutlined,
  MenuOutlined,
  MessageOutlined,
  MinusOutlined,
  MonitorOutlined,
  MoreOutlined,
  NotificationOutlined,
  PaperClipOutlined,
  PhoneOutlined,
  PictureOutlined,
  PieChartOutlined,
  PlusOutlined,
  ProfileOutlined,
  ProjectOutlined,
  PropertySafetyOutlined,
  QuestionCircleOutlined,
  RadarChartOutlined,
  ReadOutlined,
  ReloadOutlined,
  RightOutlined,
  RobotOutlined,
  RollbackOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
  ScheduleOutlined,
  SearchOutlined,
  SecurityScanOutlined,
  SettingOutlined,
  ShareAltOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  SolutionOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  SwapOutlined,
  TagOutlined,
  TagsOutlined,
  TeamOutlined,
  ToolOutlined,
  TransactionOutlined,
  UnlockOutlined,
  UploadOutlined,
  UserAddOutlined,
  UserOutlined,
  UserSwitchOutlined,
  VideoCameraOutlined,
  WalletOutlined,
  WarningOutlined,
} from "@ant-design/icons";

export type MenuIconCategory =
  | "overview"
  | "user"
  | "system"
  | "file"
  | "business"
  | "message"
  | "action"
  | "direction";

export const menuIconCategories: Array<{
  value: "all" | MenuIconCategory;
  label: string;
}> = [
  { value: "all", label: "全部" },
  { value: "overview", label: "概览图表" },
  { value: "user", label: "用户组织" },
  { value: "system", label: "系统安全" },
  { value: "file", label: "文件内容" },
  { value: "business", label: "业务办公" },
  { value: "message", label: "消息提示" },
  { value: "action", label: "常用操作" },
  { value: "direction", label: "方向导航" },
];

type IconComponent = ComponentType;

type MenuIconDefinition = {
  label: string;
  value: string;
  category: MenuIconCategory;
  component: IconComponent;
  keywords?: string[];
};

const menuIconDefinitions: MenuIconDefinition[] = [
  // 概览与图表
  { label: "仪表盘", value: "DashboardOutlined", category: "overview", component: DashboardOutlined, keywords: ["dashboard", "工作台"] },
  { label: "首页", value: "HomeOutlined", category: "overview", component: HomeOutlined, keywords: ["home", "主页"] },
  { label: "应用模块", value: "AppstoreOutlined", category: "overview", component: AppstoreOutlined, keywords: ["app", "模块"] },
  { label: "桌面", value: "DesktopOutlined", category: "overview", component: DesktopOutlined },
  { label: "监控", value: "MonitorOutlined", category: "overview", component: MonitorOutlined },
  { label: "控制台", value: "ControlOutlined", category: "overview", component: ControlOutlined },
  { label: "趋势", value: "FundOutlined", category: "overview", component: FundOutlined },
  { label: "饼图", value: "PieChartOutlined", category: "overview", component: PieChartOutlined },
  { label: "柱状图", value: "BarChartOutlined", category: "overview", component: BarChartOutlined },
  { label: "折线图", value: "LineChartOutlined", category: "overview", component: LineChartOutlined },
  { label: "面积图", value: "AreaChartOutlined", category: "overview", component: AreaChartOutlined },
  { label: "雷达图", value: "RadarChartOutlined", category: "overview", component: RadarChartOutlined },
  { label: "散点图", value: "DotChartOutlined", category: "overview", component: DotChartOutlined },

  // 用户与组织
  { label: "用户", value: "UserOutlined", category: "user", component: UserOutlined, keywords: ["user", "人员"] },
  { label: "新增用户", value: "UserAddOutlined", category: "user", component: UserAddOutlined },
  { label: "切换用户", value: "UserSwitchOutlined", category: "user", component: UserSwitchOutlined },
  { label: "团队", value: "TeamOutlined", category: "user", component: TeamOutlined, keywords: ["team", "群组"] },
  { label: "联系人", value: "ContactsOutlined", category: "user", component: ContactsOutlined },
  { label: "身份卡", value: "IdcardOutlined", category: "user", component: IdcardOutlined },
  { label: "人员档案", value: "SolutionOutlined", category: "user", component: SolutionOutlined },
  { label: "管理员", value: "CrownOutlined", category: "user", component: CrownOutlined },
  { label: "审核", value: "AuditOutlined", category: "user", component: AuditOutlined },
  { label: "组织架构", value: "ApartmentOutlined", category: "user", component: ApartmentOutlined },
  { label: "集群组织", value: "ClusterOutlined", category: "user", component: ClusterOutlined },
  { label: "分支", value: "BranchesOutlined", category: "user", component: BranchesOutlined },
  { label: "分享", value: "ShareAltOutlined", category: "user", component: ShareAltOutlined },

  // 系统与安全
  { label: "系统设置", value: "SettingOutlined", category: "system", component: SettingOutlined, keywords: ["setting", "配置"] },
  { label: "工具", value: "ToolOutlined", category: "system", component: ToolOutlined },
  { label: "菜单", value: "MenuOutlined", category: "system", component: MenuOutlined },
  { label: "机器人", value: "RobotOutlined", category: "system", component: RobotOutlined, keywords: ["AI", "智能"] },
  { label: "安全证书", value: "SafetyCertificateOutlined", category: "system", component: SafetyCertificateOutlined, keywords: ["权限"] },
  { label: "安全扫描", value: "SecurityScanOutlined", category: "system", component: SecurityScanOutlined },
  { label: "锁定", value: "LockOutlined", category: "system", component: LockOutlined },
  { label: "解锁", value: "UnlockOutlined", category: "system", component: UnlockOutlined },
  { label: "密钥", value: "KeyOutlined", category: "system", component: KeyOutlined },
  { label: "查看", value: "EyeOutlined", category: "system", component: EyeOutlined },
  { label: "数据库", value: "DatabaseOutlined", category: "system", component: DatabaseOutlined },
  { label: "云服务", value: "CloudServerOutlined", category: "system", component: CloudServerOutlined },
  { label: "接口", value: "ApiOutlined", category: "system", component: ApiOutlined },
  { label: "代码", value: "CodeOutlined", category: "system", component: CodeOutlined },
  { label: "缺陷", value: "BugOutlined", category: "system", component: BugOutlined },
  { label: "部署单元", value: "DeploymentUnitOutlined", category: "system", component: DeploymentUnitOutlined },
  { label: "全球", value: "GlobalOutlined", category: "system", component: GlobalOutlined },

  // 文件与内容
  { label: "文件夹", value: "FolderOpenOutlined", category: "file", component: FolderOpenOutlined },
  { label: "关闭文件夹", value: "FolderOutlined", category: "file", component: FolderOutlined },
  { label: "文件", value: "FileOutlined", category: "file", component: FileOutlined },
  { label: "文档", value: "FileTextOutlined", category: "file", component: FileTextOutlined },
  { label: "资料档案", value: "ProfileOutlined", category: "file", component: ProfileOutlined },
  { label: "阅读", value: "ReadOutlined", category: "file", component: ReadOutlined },
  { label: "书籍", value: "BookOutlined", category: "file", component: BookOutlined },
  { label: "表单", value: "FormOutlined", category: "file", component: FormOutlined },
  { label: "复制", value: "CopyOutlined", category: "file", component: CopyOutlined },
  { label: "附件", value: "PaperClipOutlined", category: "file", component: PaperClipOutlined },
  { label: "链接", value: "LinkOutlined", category: "file", component: LinkOutlined },
  { label: "图片", value: "PictureOutlined", category: "file", component: PictureOutlined },
  { label: "视频", value: "VideoCameraOutlined", category: "file", component: VideoCameraOutlined },
  { label: "音频", value: "AudioOutlined", category: "file", component: AudioOutlined },
  { label: "上传", value: "UploadOutlined", category: "file", component: UploadOutlined },
  { label: "下载", value: "DownloadOutlined", category: "file", component: DownloadOutlined },
  { label: "收件箱", value: "InboxOutlined", category: "file", component: InboxOutlined },

  // 业务与办公
  { label: "店铺", value: "ShopOutlined", category: "business", component: ShopOutlined },
  { label: "购物", value: "ShoppingOutlined", category: "business", component: ShoppingOutlined },
  { label: "购物车", value: "ShoppingCartOutlined", category: "business", component: ShoppingCartOutlined },
  { label: "钱包", value: "WalletOutlined", category: "business", component: WalletOutlined },
  { label: "账簿", value: "AccountBookOutlined", category: "business", component: AccountBookOutlined },
  { label: "信用卡", value: "CreditCardOutlined", category: "business", component: CreditCardOutlined },
  { label: "交易", value: "TransactionOutlined", category: "business", component: TransactionOutlined },
  { label: "资产安全", value: "PropertySafetyOutlined", category: "business", component: PropertySafetyOutlined },
  { label: "礼物", value: "GiftOutlined", category: "business", component: GiftOutlined },
  { label: "标签", value: "TagOutlined", category: "business", component: TagOutlined },
  { label: "标签组", value: "TagsOutlined", category: "business", component: TagsOutlined },
  { label: "日历", value: "CalendarOutlined", category: "business", component: CalendarOutlined },
  { label: "日程", value: "ScheduleOutlined", category: "business", component: ScheduleOutlined },
  { label: "时间", value: "ClockCircleOutlined", category: "business", component: ClockCircleOutlined },
  { label: "项目", value: "ProjectOutlined", category: "business", component: ProjectOutlined },
  { label: "任务完成", value: "CarryOutOutlined", category: "business", component: CarryOutOutlined },

  // 消息与提示
  { label: "通知铃声", value: "BellOutlined", category: "message", component: BellOutlined },
  { label: "公告", value: "NotificationOutlined", category: "message", component: NotificationOutlined },
  { label: "消息", value: "MessageOutlined", category: "message", component: MessageOutlined },
  { label: "评论", value: "CommentOutlined", category: "message", component: CommentOutlined },
  { label: "邮件", value: "MailOutlined", category: "message", component: MailOutlined },
  { label: "电话", value: "PhoneOutlined", category: "message", component: PhoneOutlined },
  { label: "客服", value: "CustomerServiceOutlined", category: "message", component: CustomerServiceOutlined },
  { label: "问题", value: "QuestionCircleOutlined", category: "message", component: QuestionCircleOutlined },
  { label: "信息", value: "InfoCircleOutlined", category: "message", component: InfoCircleOutlined },
  { label: "警告", value: "WarningOutlined", category: "message", component: WarningOutlined },

  // 常用操作
  { label: "新增", value: "PlusOutlined", category: "action", component: PlusOutlined },
  { label: "减少", value: "MinusOutlined", category: "action", component: MinusOutlined },
  { label: "编辑", value: "EditOutlined", category: "action", component: EditOutlined },
  { label: "删除", value: "DeleteOutlined", category: "action", component: DeleteOutlined },
  { label: "搜索", value: "SearchOutlined", category: "action", component: SearchOutlined },
  { label: "刷新", value: "ReloadOutlined", category: "action", component: ReloadOutlined },
  { label: "保存", value: "SaveOutlined", category: "action", component: SaveOutlined },
  { label: "确认", value: "CheckOutlined", category: "action", component: CheckOutlined },
  { label: "关闭", value: "CloseOutlined", category: "action", component: CloseOutlined },
  { label: "筛选", value: "FilterOutlined", category: "action", component: FilterOutlined },
  { label: "升序", value: "SortAscendingOutlined", category: "action", component: SortAscendingOutlined },
  { label: "降序", value: "SortDescendingOutlined", category: "action", component: SortDescendingOutlined },
  { label: "展开", value: "ExpandOutlined", category: "action", component: ExpandOutlined },
  { label: "收起", value: "CompressOutlined", category: "action", component: CompressOutlined },
  { label: "更多", value: "MoreOutlined", category: "action", component: MoreOutlined },
  { label: "省略", value: "EllipsisOutlined", category: "action", component: EllipsisOutlined },
  { label: "拖拽", value: "DragOutlined", category: "action", component: DragOutlined },

  // 方向与导航
  { label: "向上", value: "ArrowUpOutlined", category: "direction", component: ArrowUpOutlined },
  { label: "向下", value: "ArrowDownOutlined", category: "direction", component: ArrowDownOutlined },
  { label: "向左", value: "ArrowLeftOutlined", category: "direction", component: ArrowLeftOutlined },
  { label: "向右", value: "ArrowRightOutlined", category: "direction", component: ArrowRightOutlined },
  { label: "左箭头", value: "LeftOutlined", category: "direction", component: LeftOutlined },
  { label: "右箭头", value: "RightOutlined", category: "direction", component: RightOutlined },
  { label: "交换", value: "SwapOutlined", category: "direction", component: SwapOutlined },
  { label: "进入", value: "EnterOutlined", category: "direction", component: EnterOutlined },
  { label: "回退", value: "RollbackOutlined", category: "direction", component: RollbackOutlined },
  { label: "登录", value: "LoginOutlined", category: "direction", component: LoginOutlined },
  { label: "退出", value: "LogoutOutlined", category: "direction", component: LogoutOutlined },
];

export type MenuIconName = (typeof menuIconDefinitions)[number]["value"];

export const menuIconOptions = menuIconDefinitions.map((definition) => ({
  label: definition.label,
  value: definition.value,
  category: definition.category,
  keywords: definition.keywords,
}));

const menuIconComponents = new Map(
  menuIconDefinitions.map((definition) => [definition.value, definition.component]),
);

export function getMenuIcon(name?: string | null) {
  if (!name) return undefined;

  const Icon = menuIconComponents.get(name);
  return Icon ? <Icon /> : undefined;
}
