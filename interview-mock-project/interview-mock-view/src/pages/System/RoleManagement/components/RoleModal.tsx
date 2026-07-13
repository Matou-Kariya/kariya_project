import { Form, Input, Modal, Select } from "antd";
import { useEffect } from "react";
import type { RolePayload, RoleRecord } from "@/api/role";
import "./RoleModal.css";

export type RoleModalMode = "create" | "edit";

export type RoleFormValues = RolePayload;

type RoleModalProps = {
  open: boolean;
  mode: RoleModalMode;
  record?: RoleRecord | null;
  confirmLoading?: boolean;
  onCancel: () => void;
  onSubmit: (values: RoleFormValues) => Promise<void> | void;
};

export function RoleModal({ open, mode, record, confirmLoading = false, onCancel, onSubmit }: RoleModalProps) {
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
        status: record.status,
      });
    }
  }, [open, isCreate, record, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit(values);
  };

  return (
    <Modal
      title={isCreate ? "新增角色" : "编辑角色"}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      width={680}
      centered
      destroyOnHidden
      className="role-modal"
      okText="确定"
      cancelText="取消"
    >
      <Form form={form} layout="vertical" className="role-modal-form" initialValues={{ status: 1 }}>
        <Form.Item label="角色名称" name="roleName" rules={[{ required: true, message: "请输入角色名称" }, { max: 50 }]}>
          <Input placeholder="例如：面试官" allowClear />
        </Form.Item>

        <Form.Item label="角色标识" name="roleKey" tooltip="用于权限判断，例如 admin、interviewer" rules={[{ required: true, message: "请输入角色标识" }, { pattern: /^[A-Za-z][A-Za-z0-9_-]*$/, message: "请以字母开头，只使用字母、数字、下划线或中划线" }]}>
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
      </Form>
    </Modal>
  );
}
