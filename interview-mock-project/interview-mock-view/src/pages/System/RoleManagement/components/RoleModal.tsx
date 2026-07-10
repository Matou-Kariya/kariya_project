import { Form, Input, Modal, Select } from "antd";
import { useEffect } from "react";
import "./RoleModal.css";

const { TextArea } = Input;

export type RoleRecord = {
  id: number;
  roleName: string;
  roleKey: string;
  description: string;
  status: 0 | 1;
  userCount: number;
  createTime: string;
};

export type RoleModalMode = "create" | "edit";

export type RoleFormValues = {
  roleName: string;
  roleKey: string;
  description?: string;
  status: 0 | 1;
};

type RoleModalProps = {
  open: boolean;
  mode: RoleModalMode;
  record?: RoleRecord | null;
  onCancel: () => void;
  onSubmit: (values: RoleFormValues) => void;
};

export function RoleModal({ open, mode, record, onCancel, onSubmit }: RoleModalProps) {
  const [form] = Form.useForm<RoleFormValues>();

  const isCreate = mode === "create";

  useEffect(() => {
    if (!open) return;

    if (isCreate) {
      form.resetFields();
      form.setFieldsValue({
        status: 1,
      });
      return;
    }

    if (record) {
      form.setFieldsValue({
        roleName: record.roleName,
        roleKey: record.roleKey,
        description: record.description,
        status: record.status,
      });
    }
  }, [open, isCreate, record, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit(values);
  };

  return (
    <Modal
      title={isCreate ? "新增角色" : "编辑角色"}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      width={680}
      centered
      destroyOnHidden
      className="role-modal"
      okText="确定"
      cancelText="取消"
    >
      <Form form={form} layout="vertical" className="role-modal-form" initialValues={{ status: 1 }}>
        <Form.Item label="角色名称" name="roleName" rules={[{ required: true, message: "请输入角色名称" }]}>
          <Input placeholder="例如：面试官" allowClear />
        </Form.Item>

        <Form.Item label="角色标识" name="roleKey" rules={[{ required: true, message: "请输入角色标识" }]}>
          <Input placeholder="例如：interviewer" allowClear />
        </Form.Item>

        <Form.Item label="状态" name="status" rules={[{ required: true, message: "请选择状态" }]}>
          <Select
            options={[
              { label: "启用", value: 1 },
              { label: "停用", value: 0 },
            ]}
          />
        </Form.Item>

        <Form.Item label="角色描述" name="description">
          <TextArea rows={4} placeholder="请输入角色描述，用于说明该角色拥有的职责范围" showCount maxLength={120} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
