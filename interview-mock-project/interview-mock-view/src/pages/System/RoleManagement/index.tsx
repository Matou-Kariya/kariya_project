import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, SettingOutlined } from "@ant-design/icons";
import { Card, Form, Input, Pagination, Select, Space, Table, Tag, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { AppButton } from "@/components/AppButton";
import { RoleModal } from "./components/RoleModal";
import type { RoleFormValues, RoleModalMode, RoleRecord } from "./components/RoleModal";
import "./index.css";

const initialRoles: RoleRecord[] = [
  {
    id: 1,
    roleName: "超级管理员",
    roleKey: "admin",
    description: "拥有系统全部菜单与按钮权限",
    status: 1,
    userCount: 1,
    createTime: "2026-07-07 10:03:32",
  },
  {
    id: 2,
    roleName: "面试官",
    roleKey: "interviewer",
    description: "可管理题库、面试记录与候选人评分",
    status: 1,
    userCount: 6,
    createTime: "2026-07-08 14:20:15",
  },
  {
    id: 3,
    roleName: "普通用户",
    roleKey: "user",
    description: "仅可查看个人面试练习数据",
    status: 0,
    userCount: 18,
    createTime: "2026-07-09 09:18:41",
  },
];

export default function RoleManagement() {
  const [searchForm] = Form.useForm();

  const [roles, setRoles] = useState<RoleRecord[]>(initialRoles);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<RoleModalMode>("create");
  const [editingRole, setEditingRole] = useState<RoleRecord | null>(null);

  const openCreateModal = () => {
    setModalMode("create");
    setEditingRole(null);
    setModalOpen(true);
  };

  const openEditModal = (record: RoleRecord) => {
    setModalMode("edit");
    setEditingRole(record);
    setModalOpen(true);
  };

  const handleModalSubmit = (values: RoleFormValues) => {
    if (modalMode === "create") {
      const newRole: RoleRecord = {
        id: Date.now(),
        roleName: values.roleName,
        roleKey: values.roleKey,
        description: values.description || "-",
        status: values.status,
        userCount: 0,
        createTime: "2026-07-10 10:00:00",
      };

      setRoles((prev) => [newRole, ...prev]);
      setModalOpen(false);
      return;
    }

    if (modalMode === "edit" && editingRole) {
      setRoles((prev) =>
        prev.map((item) =>
          item.id === editingRole.id
            ? {
                ...item,
                roleName: values.roleName,
                roleKey: values.roleKey,
                description: values.description || "-",
                status: values.status,
              }
            : item,
        ),
      );

      setModalOpen(false);
    }
  };

  const columns: ColumnsType<RoleRecord> = [
    {
      title: "角色名称",
      dataIndex: "roleName",
      width: 220,
      render: (text, record) => (
        <div className="role-name-cell">
          <span className="role-name-cell__title">{text}</span>
          <span className="role-name-cell__key">{record.roleKey}</span>
        </div>
      ),
    },
    {
      title: "角色标识",
      dataIndex: "roleKey",
      width: 160,
      render: (value) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: "描述",
      dataIndex: "description",
      width: 360,
      ellipsis: true,
    },
    {
      title: "用户数",
      dataIndex: "userCount",
      width: 110,
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 110,
      render: (status) => (status === 1 ? <Tag color="success">启用</Tag> : <Tag>停用</Tag>),
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      width: 190,
    },
    {
      title: "操作",
      width: 210,
      align: "center",
      render: (_, record) => (
        <Space size={10} className="role-table-actions">
          <Button type="link" className="role-action-link" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            编辑
          </Button>

          <Button type="link" className="role-action-link" icon={<SettingOutlined />}>
            权限
          </Button>

          <Button type="link" danger className="role-action-link" icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="role-page">
      <Card className="role-search-card" variant="borderless">
        <Form form={searchForm} className="role-search-form">
          <div className="role-search-grid">
            <Form.Item label="角色名称" name="roleName">
              <Input placeholder="请输入角色名称" allowClear />
            </Form.Item>

            <Form.Item label="角色标识" name="roleKey">
              <Input placeholder="请输入角色标识" allowClear />
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

            <div className="role-search-actions">
              <AppButton tone="primary" icon={<SearchOutlined />}>
                查询
              </AppButton>

              <AppButton icon={<ReloadOutlined />} onClick={() => searchForm.resetFields()}>
                重置
              </AppButton>
            </div>
          </div>
        </Form>
      </Card>

      <Card
        className="role-table-card"
        variant="borderless"
        title={
          <div className="role-table-title">
            <span>角色列表</span>
            <small>用于维护后台用户的角色与权限分组</small>
          </div>
        }
        extra={
          <Space>
            <AppButton tone="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              新增角色
            </AppButton>

            <AppButton icon={<ReloadOutlined />} />
            <AppButton icon={<SettingOutlined />} />
          </Space>
        }
      >
        <Table rowKey="id" columns={columns} dataSource={roles} pagination={false} tableLayout="fixed" scroll={{ x: 1380 }} />

        <div className="role-pagination">
          <Pagination current={1} pageSize={10} total={roles.length} showSizeChanger showQuickJumper showTotal={(total) => `共 ${total} 条`} />
        </div>
      </Card>

      <RoleModal open={modalOpen} mode={modalMode} record={editingRole} onCancel={() => setModalOpen(false)} onSubmit={handleModalSubmit} />
    </div>
  );
}
