import {
  App,
  Button,
  Card,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";
import {
  ApartmentOutlined,
  DownOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  RightOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import dayjs from "dayjs";
import type { Key } from "react";
import type { ColumnsType } from "antd/es/table";
import { AppButton } from "@/components/AppButton";
import {
  createMenuApi,
  deleteMenuApi,
  getMenuListApi,
  getUserMenusApi,
  updateMenuApi,
} from "@/api/menu";
import type { MenuPayload } from "@/api/menu";
import type { DbMenu, MenuType } from "@/types/menu";
import { setMenus } from "@/store/slices/userSlice";
import { getMenuIcon } from "@/constants/menuIcons";
import { MenuModal } from "./components/MenuModal";
import type { MenuFormValues, MenuModalMode } from "./components/MenuModal";
import "./index.css";

type SearchValues = {
  menuName?: string;
  menuType?: MenuType;
  status?: 0 | 1;
};

function flattenMenuIds(menus: DbMenu[]): Key[] {
  return menus.flatMap((menu) => {
    const children = menu.children ?? [];
    return children.length > 0 ? [menu.id, ...flattenMenuIds(children)] : [];
  });
}

function countMenus(menus: DbMenu[]): number {
  return menus.reduce((total, menu) => total + 1 + countMenus(menu.children ?? []), 0);
}

function filterMenuTree(menus: DbMenu[], filters: SearchValues): DbMenu[] {
  const keyword = filters.menuName?.trim().toLowerCase();

  return menus.flatMap((menu) => {
    const children = filterMenuTree(menu.children ?? [], filters);
    const matchesName = !keyword || menu.menuName.toLowerCase().includes(keyword);
    const matchesType = filters.menuType === undefined || menu.menuType === filters.menuType;
    const matchesStatus = filters.status === undefined || menu.status === filters.status;

    if ((matchesName && matchesType && matchesStatus) || children.length > 0) {
      return [{ ...menu, children }];
    }

    return [];
  });
}

function typeMeta(type: MenuType) {
  if (type === 0) return { color: "blue", label: "目录" };
  if (type === 1) return { color: "cyan", label: "菜单" };
  return { color: "purple", label: "按钮" };
}

export default function MenuManagement() {
  const [searchForm] = Form.useForm<SearchValues>();
  const { message, modal } = App.useApp();
  const dispatch = useDispatch();
  const [menus, setMenuData] = useState<DbMenu[]>([]);
  const [filters, setFilters] = useState<SearchValues>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<MenuModalMode>("create");
  const [editingMenu, setEditingMenu] = useState<DbMenu | null>(null);
  const [initialParentId, setInitialParentId] = useState(0);
  const [expandedRowKeys, setExpandedRowKeys] = useState<readonly Key[]>([]);

  const loadMenus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMenuListApi();
      setMenuData(data);
      setExpandedRowKeys(flattenMenuIds(data));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void getMenuListApi()
      .then((data) => {
        if (cancelled) return;
        setMenuData(data);
        setExpandedRowKeys(flattenMenuIds(data));
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleMenus = useMemo(() => filterMenuTree(menus, filters), [filters, menus]);
  const total = countMenus(visibleMenus);
  const allExpanded = menus.length > 0 && expandedRowKeys.length === flattenMenuIds(menus).length;

  const syncDynamicMenus = async () => {
    const userMenus = await getUserMenusApi();
    dispatch(setMenus(userMenus));
  };

  const refreshAfterMutation = async () => {
    await Promise.all([loadMenus(), syncDynamicMenus()]);
  };

  const openCreateModal = (parentId = 0) => {
    setModalMode("create");
    setEditingMenu(null);
    setInitialParentId(parentId);
    setModalOpen(true);
  };

  const openEditModal = (record: DbMenu) => {
    setModalMode("edit");
    setEditingMenu(record);
    setInitialParentId(record.parentId ?? 0);
    setModalOpen(true);
  };

  const handleModalSubmit = async (values: MenuFormValues) => {
    const payload: MenuPayload = {
      ...values,
      path: values.path?.trim(),
      component: values.component?.trim(),
      permission: values.permission?.trim(),
    };

    setSaving(true);
    try {
      if (modalMode === "create") {
        await createMenuApi(payload);
        message.success("菜单新增成功");
      } else if (editingMenu) {
        await updateMenuApi(editingMenu.id, payload);
        message.success("菜单修改成功");
      }

      setModalOpen(false);
      await refreshAfterMutation();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (record: DbMenu) => {
    modal.confirm({
      title: "确认删除菜单？",
      content: `删除“${record.menuName}”后无法恢复；如已分配给角色，对应授权关系也会一并删除。`,
      okText: "删除",
      cancelText: "取消",
      okButtonProps: { danger: true },
      centered: true,
      async onOk() {
        await deleteMenuApi(record.id);
        message.success("菜单删除成功");
        await refreshAfterMutation();
      },
    });
  };

  const handleSearch = (values: SearchValues) => {
    setFilters(values);
    setExpandedRowKeys(flattenMenuIds(menus));
  };

  const handleReset = () => {
    searchForm.resetFields();
    setFilters({});
    setExpandedRowKeys(flattenMenuIds(menus));
  };

  const toggleExpandAll = () => {
    setExpandedRowKeys(allExpanded ? [] : flattenMenuIds(menus));
  };

  const columns: ColumnsType<DbMenu> = [
    {
      title: "菜单名称",
      dataIndex: "menuName",
      fixed: "left",
      width: 250,
      render: (name: string, record) => (
        <div className="menu-name-cell">
          <span className={`menu-name-cell__icon menu-name-cell__icon--${record.menuType}`}>
            {getMenuIcon(record.icon) ?? <ApartmentOutlined />}
          </span>
          <span className="menu-name-cell__content">
            <strong>{name}</strong>
          </span>
        </div>
      ),
    },
    {
      title: "类型",
      dataIndex: "menuType",
      width: 90,
      align: "center",
      render: (type: MenuType) => {
        const meta = typeMeta(type);
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: "路由地址",
      dataIndex: "path",
      width: 160,
      render: (value?: string) => <span className="menu-code-text">{value || "-"}</span>,
    },
    {
      title: "组件路径",
      dataIndex: "component",
      width: 230,
      ellipsis: true,
      render: (value?: string) => (
        <Tooltip title={value}>
          <span className="menu-code-text">{value || "-"}</span>
        </Tooltip>
      ),
    },
    {
      title: "权限标识",
      dataIndex: "permission",
      width: 190,
      ellipsis: true,
      render: (value?: string) =>
        value ? (
          <Tooltip title={value}>
            <Tag className="menu-permission-tag">{value}</Tag>
          </Tooltip>
        ) : (
          "-"
        ),
    },
    {
      title: "排序",
      dataIndex: "orderNum",
      width: 80,
      align: "center",
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 90,
      align: "center",
      render: (status: 0 | 1) => (status === 1 ? <Tag color="success">启用</Tag> : <Tag>停用</Tag>),
    },
    {
      title: "更新时间",
      dataIndex: "updateTime",
      width: 180,
      render: (value?: string) => (value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "-"),
    },
    {
      title: "操作",
      fixed: "right",
      width: 250,
      align: "center",
      render: (_, record) => (
        <Space size={6} className="menu-table-actions">
          {record.menuType !== 2 ? (
            <Button type="link" className="menu-action-link" icon={<PlusOutlined />} onClick={() => openCreateModal(record.id)}>
              新增下级
            </Button>
          ) : null}
          <Button type="link" className="menu-action-link" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            编辑
          </Button>
          <Button type="link" danger className="menu-action-link" icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="menu-page">
      <Card className="menu-search-card" variant="borderless">
        <Form form={searchForm} className="menu-search-form" onFinish={handleSearch}>
          <div className="menu-search-grid">
            <Form.Item label="菜单名称" name="menuName">
              <Input placeholder="请输入菜单名称" allowClear />
            </Form.Item>

            <Form.Item label="菜单类型" name="menuType">
              <Select
                placeholder="请选择菜单类型"
                allowClear
                options={[
                  { label: "目录", value: 0 },
                  { label: "菜单", value: 1 },
                  { label: "按钮", value: 2 },
                ]}
              />
            </Form.Item>

            <Form.Item label="状态" name="status">
              <Select
                placeholder="请选择状态"
                allowClear
                options={[
                  { label: "启用", value: 1 },
                  { label: "停用", value: 0 },
                ]}
              />
            </Form.Item>

            <div className="menu-search-actions">
              <AppButton tone="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </AppButton>
              <AppButton icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </AppButton>
            </div>
          </div>
        </Form>
      </Card>

      <Card
        className="menu-table-card"
        variant="borderless"
        title={
          <div className="menu-table-title">
            <span>菜单列表</span>
            <small>维护后台目录、页面路由与按钮权限，当前共 {total} 个节点</small>
          </div>
        }
        extra={
          <Space>
            <AppButton tone="primary" icon={<PlusOutlined />} onClick={() => openCreateModal()}>
              新增菜单
            </AppButton>
            <AppButton icon={<ApartmentOutlined />} onClick={toggleExpandAll}>
              {allExpanded ? "折叠全部" : "展开全部"}
            </AppButton>
            <AppButton icon={<ReloadOutlined />} loading={loading} onClick={() => void loadMenus()} />
          </Space>
        }
      >
        <Table<DbMenu>
          rowKey="id"
          rowClassName={(record) => (record.parentId === 0 ? "menu-tree-row--root" : "menu-tree-row--child")}
          columns={columns}
          dataSource={visibleMenus}
          loading={loading}
          pagination={false}
          tableLayout="fixed"
          scroll={{ x: 1530 }}
          expandable={{
            expandedRowKeys,
            onExpandedRowsChange: setExpandedRowKeys,
            indentSize: 28,
            rowExpandable: (record) => Boolean(record.children?.length),
            expandIcon: ({ expanded, onExpand, record }) =>
              record.children?.length ? (
                <button
                  type="button"
                  className={`menu-tree-expand${expanded ? " is-expanded" : ""}`}
                  aria-label={expanded ? "收起子菜单" : "展开子菜单"}
                  onClick={(event) => onExpand(record, event)}
                >
                  {expanded ? <DownOutlined /> : <RightOutlined />}
                </button>
              ) : (
                <span className="menu-tree-expand-spacer" />
              ),
          }}
        />

        <div className="menu-table-footer">共 {total} 条菜单数据</div>
      </Card>

      <MenuModal
        open={modalOpen}
        mode={modalMode}
        menus={menus}
        record={editingMenu}
        initialParentId={initialParentId}
        confirmLoading={saving}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
