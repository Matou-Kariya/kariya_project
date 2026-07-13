import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import { App, Avatar, Button, Card, Form, Input, Select, Space, Table, Tag } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { createUserApi, deleteUserApi, getUserPageApi, updateUserApi } from "@/api/user";
import type { RoleOption, UserPayload, UserQuery, UserRecord } from "@/api/user";
import { getRoleOptionsApi } from "@/api/role";
import { AppButton } from "@/components/AppButton";
import { UserModal } from "./UserModal";
import type { UserModalMode } from "./UserModal";
import "./index.css";

type SearchValues = Pick<UserQuery, "username" | "nickname" | "status">;

export default function UserManagement() {
  const { message, modal } = App.useApp();
  const [searchForm] = Form.useForm<SearchValues>();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [filters, setFilters] = useState<SearchValues>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<UserModalMode>("create");
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const { current, pageSize } = pagination;

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserPageApi({ current, size: pageSize, ...filters });
      setUsers(data.records);
      setPagination((value) => ({ ...value, current: data.current, pageSize: data.size, total: data.total }));
    } finally {
      setLoading(false);
    }
  }, [current, filters, pageSize]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadUsers(), 0);
    return () => window.clearTimeout(timer);
  }, [loadUsers]);
  useEffect(() => {
    const timer = window.setTimeout(() => void getRoleOptionsApi().then(setRoles), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const openCreate = () => { setModalMode("create"); setEditingUser(null); setModalOpen(true); };
  const openEdit = (record: UserRecord) => { setModalMode("edit"); setEditingUser(record); setModalOpen(true); };

  const handleSubmit = async (values: UserPayload) => {
    setSaving(true);
    try {
      if (modalMode === "create") {
        await createUserApi(values);
        message.success("用户新增成功");
      } else if (editingUser) {
        await updateUserApi(editingUser.id, values);
        message.success("用户修改成功");
      }
      setModalOpen(false);
      await loadUsers();
    } finally { setSaving(false); }
  };

  const handleDelete = (record: UserRecord) => {
    modal.confirm({
      title: "确认删除用户？",
      content: `删除“${record.username}”后，其角色关联也会被清除，且无法恢复。`,
      okText: "删除", cancelText: "取消", okButtonProps: { danger: true }, centered: true,
      async onOk() {
        await deleteUserApi(record.id);
        message.success("用户删除成功");
        if (users.length === 1 && pagination.current > 1) setPagination((value) => ({ ...value, current: value.current - 1 }));
        else await loadUsers();
      },
    });
  };

  const handleSearch = (values: SearchValues) => { setFilters(values); setPagination((value) => ({ ...value, current: 1 })); };
  const handleReset = () => { searchForm.resetFields(); setFilters({}); setPagination((value) => ({ ...value, current: 1 })); };
  const handleTableChange = (page: TablePaginationConfig) => setPagination((value) => ({ ...value, current: page.current ?? 1, pageSize: page.pageSize ?? 10 }));

  const columns: ColumnsType<UserRecord> = [
    { title: "用户", dataIndex: "username", width: 230, render: (_, record) => <div className="user-name-cell"><Avatar src={record.avatar} icon={<UserOutlined />} /><span><strong>{record.nickname || record.username}</strong><small>@{record.username}</small></span></div> },
    { title: "联系方式", width: 250, render: (_, record) => <div className="user-contact-cell"><span>{record.email || "未填写邮箱"}</span><small>{record.phone || "未填写手机号"}</small></div> },
    { title: "角色", dataIndex: "roles", width: 260, render: (items: RoleOption[]) => items.length ? items.map((role) => <Tag key={role.id} color="blue">{role.roleName}</Tag>) : <span className="user-empty-text">未分配</span> },
    { title: "状态", dataIndex: "status", width: 100, align: "center", render: (status: 0 | 1) => status === 1 ? <Tag color="success">启用</Tag> : <Tag>停用</Tag> },
    { title: "创建时间", dataIndex: "createTime", width: 180, render: (value?: string) => value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "-" },
    { title: "操作", width: 150, align: "center", render: (_, record) => <Space size={8} className="user-table-actions"><Button type="link" className="user-action-link" icon={<EditOutlined />} onClick={() => openEdit(record)}>编辑</Button><Button type="link" danger className="user-action-link" icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>删除</Button></Space> },
  ];

  return (
    <div className="user-page">
      <Card className="user-search-card" variant="borderless">
        <Form form={searchForm} className="user-search-form" onFinish={handleSearch}>
          <div className="user-search-grid">
            <Form.Item label="用户名" name="username"><Input placeholder="请输入用户名" allowClear /></Form.Item>
            <Form.Item label="昵称" name="nickname"><Input placeholder="请输入用户昵称" allowClear /></Form.Item>
            <Form.Item label="状态" name="status"><Select placeholder="请选择状态" allowClear options={[{ label: "启用", value: 1 }, { label: "停用", value: 0 }]} /></Form.Item>
            <div className="user-search-actions"><AppButton tone="primary" htmlType="submit" icon={<SearchOutlined />}>查询</AppButton><AppButton icon={<ReloadOutlined />} onClick={handleReset}>重置</AppButton></div>
          </div>
        </Form>
      </Card>
      <Card className="user-table-card" variant="borderless" title={<div className="user-table-title"><span>用户列表</span><small>管理后台账号、联系方式与角色归属</small></div>} extra={<Space><AppButton tone="primary" icon={<PlusOutlined />} onClick={openCreate}>新增用户</AppButton><AppButton icon={<ReloadOutlined />} loading={loading} onClick={() => void loadUsers()} /></Space>}>
        <Table<UserRecord> rowKey="id" columns={columns} dataSource={users} loading={loading} tableLayout="fixed" scroll={{ x: 1170 }} pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total, showSizeChanger: true, showQuickJumper: true, showTotal: (total) => `共 ${total} 条` }} onChange={handleTableChange} />
      </Card>
      <UserModal open={modalOpen} mode={modalMode} record={editingUser} roles={roles} confirmLoading={saving} onCancel={() => setModalOpen(false)} onSubmit={handleSubmit} />
    </div>
  );
}
