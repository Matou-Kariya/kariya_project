import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SafetyCertificateOutlined, SearchOutlined, TeamOutlined } from "@ant-design/icons";
import { App, Button, Card, Form, Input, Select, Space, Table, Tag } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { createRoleApi, deleteRoleApi, getRoleOptionsApi, getRolePageApi, updateRoleApi } from "@/api/role";
import type { RolePayload, RoleQuery, RoleRecord } from "@/api/role";
import type { RoleOption } from "@/api/user";
import { getMenuListApi } from "@/api/menu";
import type { DbMenu } from "@/types/menu";
import { AppButton } from "@/components/AppButton";
import { RoleModal } from "./components/RoleModal";
import type { RoleModalMode } from "./components/RoleModal";
import { RoleUsersModal } from "./components/RoleUsersModal";
import { RolePermissionModal } from "./components/RolePermissionModal";
import "./index.css";

type SearchValues = Pick<RoleQuery, "roleName" | "roleKey" | "status">;

export default function RoleManagementPage() {
  const { message, modal } = App.useApp();
  const [searchForm] = Form.useForm<SearchValues>();
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [menus, setMenus] = useState<DbMenu[]>([]);
  const [filters, setFilters] = useState<SearchValues>({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<RoleModalMode>("create");
  const [selectedRole, setSelectedRole] = useState<RoleRecord | null>(null);
  const [usersOpen, setUsersOpen] = useState(false);
  const [permissionOpen, setPermissionOpen] = useState(false);
  const { current, pageSize } = pagination;

  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRolePageApi({ current, size: pageSize, ...filters });
      setRoles(data.records);
      setPagination((value) => ({ ...value, current: data.current, pageSize: data.size, total: data.total }));
    } finally { setLoading(false); }
  }, [current, filters, pageSize]);

  const loadOptions = useCallback(async () => setRoleOptions(await getRoleOptionsApi()), []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadRoles(), 0);
    return () => window.clearTimeout(timer);
  }, [loadRoles]);
  useEffect(() => {
    const timer = window.setTimeout(() => void Promise.all([loadOptions(), getMenuListApi().then(setMenus)]), 0);
    return () => window.clearTimeout(timer);
  }, [loadOptions]);

  const openCreate = () => { setModalMode("create"); setSelectedRole(null); setModalOpen(true); };
  const openEdit = (record: RoleRecord) => { setModalMode("edit"); setSelectedRole(record); setModalOpen(true); };

  const handleSubmit = async (values: RolePayload) => {
    setSaving(true);
    try {
      if (modalMode === "create") {
        await createRoleApi(values);
        message.success("角色新增成功");
      } else if (selectedRole) {
        await updateRoleApi(selectedRole.id, values);
        message.success("角色修改成功");
      }
      setModalOpen(false);
      await Promise.all([loadRoles(), loadOptions()]);
    } finally { setSaving(false); }
  };

  const handleDelete = (record: RoleRecord) => {
    modal.confirm({
      title: "确认删除角色？",
      content: record.userCount > 0 ? `“${record.roleName}”仍关联 ${record.userCount} 个用户，请先解除用户关联。` : `删除“${record.roleName}”后，其菜单授权也会被清除。`,
      okText: "删除", cancelText: "取消", okButtonProps: { danger: true, disabled: record.userCount > 0 }, centered: true,
      async onOk() { await deleteRoleApi(record.id); message.success("角色删除成功"); await Promise.all([loadRoles(), loadOptions()]); },
    });
  };

  const columns: ColumnsType<RoleRecord> = [
    { title: "角色名称", dataIndex: "roleName", width: 230, render: (text, record) => <div className="role-name-cell"><span className="role-name-cell__title">{text}</span><span className="role-name-cell__key">{record.roleKey}</span></div> },
    { title: "角色标识", dataIndex: "roleKey", width: 180, render: (value) => <Tag color="blue">{value}</Tag> },
    { title: "用户数", dataIndex: "userCount", width: 120, align: "center", render: (value, record) => <Button type="link" className="role-count-link" onClick={() => { setSelectedRole(record); setUsersOpen(true); }}>{value} 人</Button> },
    { title: "状态", dataIndex: "status", width: 110, align: "center", render: (status) => status === 1 ? <Tag color="success">启用</Tag> : <Tag>停用</Tag> },
    { title: "创建时间", dataIndex: "createTime", width: 190, render: (value?: string) => value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "-" },
    { title: "操作", width: 360, align: "center", render: (_, record) => <Space size={8} className="role-table-actions"><Button type="link" className="role-action-link" icon={<TeamOutlined />} onClick={() => { setSelectedRole(record); setUsersOpen(true); }}>用户</Button><Button type="link" className="role-action-link" icon={<SafetyCertificateOutlined />} onClick={() => { setSelectedRole(record); setPermissionOpen(true); }}>授权</Button><Button type="link" className="role-action-link" icon={<EditOutlined />} onClick={() => openEdit(record)}>编辑</Button><Button type="link" danger className="role-action-link" icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>删除</Button></Space> },
  ];

  const handleSearch = (values: SearchValues) => { setFilters(values); setPagination((value) => ({ ...value, current: 1 })); };
  const handleReset = () => { searchForm.resetFields(); setFilters({}); setPagination((value) => ({ ...value, current: 1 })); };
  const handleTableChange = (page: TablePaginationConfig) => setPagination((value) => ({ ...value, current: page.current ?? 1, pageSize: page.pageSize ?? 10 }));

  return (
    <div className="role-page">
      <Card className="role-search-card" variant="borderless">
        <Form form={searchForm} className="role-search-form" onFinish={handleSearch}>
          <div className="role-search-grid">
            <Form.Item label="角色名称" name="roleName"><Input placeholder="请输入角色名称" allowClear /></Form.Item>
            <Form.Item label="角色标识" name="roleKey"><Input placeholder="请输入角色标识" allowClear /></Form.Item>
            <Form.Item label="状态" name="status"><Select placeholder="请选择状态" allowClear options={[{ label: "启用", value: 1 }, { label: "停用", value: 0 }]} /></Form.Item>
            <div className="role-search-actions"><AppButton tone="primary" htmlType="submit" icon={<SearchOutlined />}>查询</AppButton><AppButton icon={<ReloadOutlined />} onClick={handleReset}>重置</AppButton></div>
          </div>
        </Form>
      </Card>
      <Card className="role-table-card" variant="borderless" title={<div className="role-table-title"><span>角色列表</span><small>维护角色、关联用户并配置菜单与按钮权限</small></div>} extra={<Space><AppButton tone="primary" icon={<PlusOutlined />} onClick={openCreate}>新增角色</AppButton><AppButton icon={<ReloadOutlined />} loading={loading} onClick={() => void loadRoles()} /></Space>}>
        <Table<RoleRecord> rowKey="id" columns={columns} dataSource={roles} loading={loading} tableLayout="fixed" scroll={{ x: 1190 }} pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total, showSizeChanger: true, showQuickJumper: true, showTotal: (total) => `共 ${total} 条` }} onChange={handleTableChange} />
      </Card>
      <RoleModal open={modalOpen} mode={modalMode} record={selectedRole} confirmLoading={saving} onCancel={() => setModalOpen(false)} onSubmit={handleSubmit} />
      <RoleUsersModal open={usersOpen} role={selectedRole} roleOptions={roleOptions} onCancel={() => setUsersOpen(false)} onChanged={() => void loadRoles()} />
      <RolePermissionModal open={permissionOpen} role={selectedRole} menus={menus} onCancel={() => setPermissionOpen(false)} onSaved={() => message.success("角色授权保存成功")} />
    </div>
  );
}
