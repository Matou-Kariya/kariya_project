import { Card, Table, Button, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: "active" | "inactive";
}

const columns: ColumnsType<User> = [
  { title: "ID", dataIndex: "id", key: "id" },
  { title: "用户名", dataIndex: "username", key: "username" },
  { title: "邮箱", dataIndex: "email", key: "email" },
  { title: "角色", dataIndex: "role", key: "role" },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    render: (status) => <Tag color={status === "active" ? "green" : "red"}>{status === "active" ? "启用" : "禁用"}</Tag>,
  },
];

const UserManagement = () => {
  return (
    <Card
      title="用户管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />}>
          新增用户
        </Button>
      }
    >
      <Table columns={columns} dataSource={[]} rowKey="id" />
    </Card>
  );
};

export default UserManagement;
