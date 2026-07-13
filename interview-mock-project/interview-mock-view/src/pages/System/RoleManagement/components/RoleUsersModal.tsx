import { PlusOutlined, ReloadOutlined, SearchOutlined, UserAddOutlined } from "@ant-design/icons";
import { App, Button, Form, Input, Modal, Table, Tag } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useCallback, useEffect, useState } from "react";
import { addUsersToRoleApi, getAvailableRoleUsersApi, getRoleUsersApi, removeUserFromRoleApi } from "@/api/role";
import type { RoleRecord, RoleUserQuery } from "@/api/role";
import { createUserApi } from "@/api/user";
import type { RoleOption, UserPayload, UserRecord } from "@/api/user";
import { AppButton } from "@/components/AppButton";
import { UserModal } from "../../UserManagement/UserModal";
import "./RoleUsersModal.css";

type RoleUsersModalProps = {
  open: boolean;
  role?: RoleRecord | null;
  roleOptions: RoleOption[];
  onCancel: () => void;
  onChanged: () => void;
};

type SearchValues = Pick<RoleUserQuery, "username" | "nickname">;

export function RoleUsersModal({ open, role, roleOptions, onCancel, onChanged }: RoleUsersModalProps) {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm<SearchValues>();
  const [availableForm] = Form.useForm<SearchValues>();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserRecord[]>([]);
  const [filters, setFilters] = useState<SearchValues>({});
  const [availableFilters, setAvailableFilters] = useState<SearchValues>({});
  const [page, setPage] = useState({ current: 1, pageSize: 10, total: 0 });
  const [availablePage, setAvailablePage] = useState({ current: 1, pageSize: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [availableOpen, setAvailableOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<React.Key[]>([]);
  const { current, pageSize } = page;
  const { current: availableCurrent, pageSize: availablePageSize } = availablePage;

  const loadUsers = useCallback(async () => {
    if (!open || !role) return;
    setLoading(true);
    try {
      const data = await getRoleUsersApi(role.id, { current, size: pageSize, ...filters });
      setUsers(data.records);
      setPage((value) => ({ ...value, total: data.total, current: data.current, pageSize: data.size }));
    } finally { setLoading(false); }
  }, [current, filters, open, pageSize, role]);

  const loadAvailableUsers = useCallback(async () => {
    if (!availableOpen || !role) return;
    setAvailableLoading(true);
    try {
      const data = await getAvailableRoleUsersApi(role.id, { current: availableCurrent, size: availablePageSize, ...availableFilters });
      setAvailableUsers(data.records);
      setAvailablePage((value) => ({ ...value, total: data.total, current: data.current, pageSize: data.size }));
    } finally { setAvailableLoading(false); }
  }, [availableCurrent, availableFilters, availableOpen, availablePageSize, role]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadUsers(), 0);
    return () => window.clearTimeout(timer);
  }, [loadUsers]);
  useEffect(() => {
    const timer = window.setTimeout(() => void loadAvailableUsers(), 0);
    return () => window.clearTimeout(timer);
  }, [loadAvailableUsers]);

  const removeUser = (user: UserRecord) => {
    if (!role) return;
    modal.confirm({
      title: "解除用户关联？", content: `“${user.username}”将不再拥有“${role.roleName}”角色。`, okText: "解除", cancelText: "取消", centered: true,
      async onOk() { await removeUserFromRoleApi(role.id, user.id); message.success("角色关联已解除"); await loadUsers(); onChanged(); },
    });
  };

  const addExistingUsers = async () => {
    if (!role || !selectedIds.length) return;
    setSaving(true);
    try {
      await addUsersToRoleApi(role.id, selectedIds.map(Number));
      message.success("用户添加成功");
      setAvailableOpen(false);
      setSelectedIds([]);
      await loadUsers();
      onChanged();
    } finally { setSaving(false); }
  };

  const createRoleUser = async (values: UserPayload) => {
    if (!role) return;
    setSaving(true);
    try {
      await createUserApi({ ...values, roleIds: Array.from(new Set([...(values.roleIds ?? []), role.id])) });
      message.success("用户创建并加入角色成功");
      setCreateOpen(false);
      await loadUsers();
      onChanged();
    } finally { setSaving(false); }
  };

  const columns: ColumnsType<UserRecord> = [
    { title: "用户名", dataIndex: "username", width: 180, render: (value, record) => <span className="role-user-name"><strong>{value}</strong><small>{record.nickname || "未设置昵称"}</small></span> },
    { title: "联系方式", width: 250, render: (_, record) => record.email || record.phone || "-" },
    { title: "状态", dataIndex: "status", width: 90, align: "center", render: (value) => value === 1 ? <Tag color="success">启用</Tag> : <Tag>停用</Tag> },
    { title: "操作", width: 110, align: "center", render: (_, record) => <Button type="link" danger className="role-user-action" onClick={() => removeUser(record)}>解除关联</Button> },
  ];

  const availableColumns: ColumnsType<UserRecord> = [
    { title: "用户名", dataIndex: "username", width: 180 },
    { title: "昵称", dataIndex: "nickname", width: 180, render: (value) => value || "-" },
    { title: "已有角色", dataIndex: "roles", render: (items: RoleOption[]) => items.length ? items.map((item) => <Tag key={item.id}>{item.roleName}</Tag>) : "未分配" },
    { title: "状态", dataIndex: "status", width: 90, render: (value) => value === 1 ? <Tag color="success">启用</Tag> : <Tag>停用</Tag> },
  ];

  return (
    <>
      <Modal title={<span>角色用户 <small className="role-users-title">{role ? `· ${role.roleName}` : ""}</small></span>} open={open} onCancel={onCancel} footer={null} width={960} centered destroyOnHidden className="role-users-modal">
        <Form form={form} onFinish={(values) => { setFilters(values); setPage((item) => ({ ...item, current: 1 })); }}>
          <div className="role-users-toolbar">
            <Form.Item name="username"><Input placeholder="搜索用户名" allowClear /></Form.Item>
            <Form.Item name="nickname"><Input placeholder="搜索昵称" allowClear /></Form.Item>
            <AppButton tone="primary" htmlType="submit" icon={<SearchOutlined />}>查询</AppButton>
            <AppButton icon={<ReloadOutlined />} onClick={() => { form.resetFields(); setFilters({}); setPage((item) => ({ ...item, current: 1 })); }}>重置</AppButton>
            <span className="role-users-toolbar__grow" />
            <AppButton icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>新建用户</AppButton>
            <AppButton tone="primary" icon={<UserAddOutlined />} onClick={() => { setAvailableOpen(true); setAvailablePage((item) => ({ ...item, current: 1 })); }}>添加已有</AppButton>
          </div>
        </Form>
        <Table<UserRecord> rowKey="id" columns={columns} dataSource={users} loading={loading} scroll={{ x: 720 }} pagination={{ current: page.current, pageSize: page.pageSize, total: page.total, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} onChange={(pagination: TablePaginationConfig) => setPage((value) => ({ ...value, current: pagination.current ?? 1, pageSize: pagination.pageSize ?? 10 }))} />
      </Modal>

      <Modal title="添加已有用户" open={availableOpen} onCancel={() => setAvailableOpen(false)} onOk={addExistingUsers} confirmLoading={saving} okButtonProps={{ disabled: !selectedIds.length }} width={820} centered destroyOnHidden className="role-user-select-modal" okText={`添加${selectedIds.length ? `（${selectedIds.length}）` : ""}`} cancelText="取消">
        <Form form={availableForm} onFinish={(values) => { setAvailableFilters(values); setAvailablePage((item) => ({ ...item, current: 1 })); }}>
          <div className="role-user-select-toolbar">
            <Form.Item name="username"><Input placeholder="搜索用户名" allowClear /></Form.Item>
            <Form.Item name="nickname"><Input placeholder="搜索昵称" allowClear /></Form.Item>
            <AppButton tone="primary" htmlType="submit" icon={<SearchOutlined />}>查询</AppButton>
          </div>
        </Form>
        <Table<UserRecord> rowKey="id" columns={availableColumns} dataSource={availableUsers} loading={availableLoading} rowSelection={{ selectedRowKeys: selectedIds, onChange: setSelectedIds }} pagination={{ current: availablePage.current, pageSize: availablePage.pageSize, total: availablePage.total, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} onChange={(pagination: TablePaginationConfig) => setAvailablePage((value) => ({ ...value, current: pagination.current ?? 1, pageSize: pagination.pageSize ?? 10 }))} />
      </Modal>

      <UserModal open={createOpen} mode="create" roles={roleOptions} initialRoleIds={role ? [role.id] : []} confirmLoading={saving} onCancel={() => setCreateOpen(false)} onSubmit={createRoleUser} />
    </>
  );
}
