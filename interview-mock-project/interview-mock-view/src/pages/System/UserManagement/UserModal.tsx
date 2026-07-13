import { Form, Input, Modal, Radio, Select } from "antd";
import { useEffect } from "react";
import type { RoleOption, UserPayload, UserRecord } from "@/api/user";
import "./UserModal.css";

export type UserModalMode = "create" | "edit";

type UserModalProps = {
  open: boolean;
  mode: UserModalMode;
  record?: UserRecord | null;
  roles: RoleOption[];
  initialRoleIds?: number[];
  confirmLoading?: boolean;
  onCancel: () => void;
  onSubmit: (values: UserPayload) => Promise<void> | void;
};

export function UserModal({ open, mode, record, roles, initialRoleIds = [], confirmLoading = false, onCancel, onSubmit }: UserModalProps) {
  const [form] = Form.useForm<UserPayload>();
  const isCreate = mode === "create";

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (isCreate) {
      form.setFieldsValue({ status: 1, roleIds: initialRoleIds });
    } else if (record) {
      form.setFieldsValue({
        username: record.username,
        nickname: record.nickname ?? undefined,
        avatar: record.avatar ?? undefined,
        email: record.email ?? undefined,
        phone: record.phone ?? undefined,
        status: record.status,
        roleIds: record.roles.map((role) => role.id),
      });
    }
  }, [form, initialRoleIds, isCreate, open, record]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit({ ...values, password: values.password?.trim() || undefined });
  };

  return (
    <Modal title={isCreate ? "新增用户" : "编辑用户"} open={open} onCancel={onCancel} onOk={handleOk} confirmLoading={confirmLoading} width={720} centered destroyOnHidden className="user-editor-modal" okText="确定" cancelText="取消">
      <Form form={form} layout="vertical" className="user-editor-form">
        <div className="user-editor-grid">
          <Form.Item label="用户名" name="username" rules={[{ required: true, message: "请输入用户名" }, { max: 50, message: "用户名不能超过 50 个字符" }]}>
            <Input placeholder="用于登录，例如：interviewer01" allowClear />
          </Form.Item>
          <Form.Item label={isCreate ? "登录密码" : "登录密码（留空不修改）"} name="password" rules={isCreate ? [{ required: true, message: "请输入登录密码" }, { min: 8, message: "密码至少 8 位" }] : [{ min: 8, message: "密码至少 8 位" }]}>
            <Input.Password placeholder={isCreate ? "请输入至少 8 位密码" : "如需修改请输入新密码"} />
          </Form.Item>
          <Form.Item label="用户昵称" name="nickname" rules={[{ max: 50, message: "昵称不能超过 50 个字符" }]}>
            <Input placeholder="用于界面展示" allowClear />
          </Form.Item>
          <Form.Item label="角色" name="roleIds">
            <Select mode="multiple" allowClear showSearch optionFilterProp="label" placeholder="请选择一个或多个角色" options={roles.map((role) => ({ value: role.id, label: `${role.roleName}（${role.roleKey}）` }))} />
          </Form.Item>
          <Form.Item label="邮箱" name="email" rules={[{ type: "email", message: "请输入正确的邮箱地址" }, { max: 100 }]}>
            <Input placeholder="例如：user@example.com" allowClear />
          </Form.Item>
          <Form.Item label="手机号" name="phone" rules={[{ max: 20, message: "手机号不能超过 20 个字符" }]}>
            <Input placeholder="请输入手机号" allowClear />
          </Form.Item>
          <Form.Item label="头像地址" name="avatar" className="user-editor-grid__full">
            <Input placeholder="请输入头像 URL，可暂时留空" allowClear />
          </Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: "请选择状态" }]}>
            <Radio.Group><Radio value={1}>启用</Radio><Radio value={0}>停用</Radio></Radio.Group>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
