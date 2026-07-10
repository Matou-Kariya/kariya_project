import { Form, Input, InputNumber, Modal, Radio, TreeSelect } from "antd";
import { useEffect, useMemo } from "react";
import type { MenuPayload } from "@/api/menu";
import type { DbMenu, MenuType } from "@/types/menu";
import { MenuIconPicker } from "./MenuIconPicker";
import "./MenuModal.css";

export type MenuModalMode = "create" | "edit";
export type MenuFormValues = MenuPayload;

type TreeSelectNode = {
  title: string;
  value: number;
  key: number;
  children?: TreeSelectNode[];
};

type MenuModalProps = {
  open: boolean;
  mode: MenuModalMode;
  menus: DbMenu[];
  record?: DbMenu | null;
  initialParentId?: number;
  confirmLoading?: boolean;
  onCancel: () => void;
  onSubmit: (values: MenuFormValues) => Promise<void> | void;
};

function collectNodeIds(menu?: DbMenu | null) {
  const ids = new Set<number>();

  const walk = (item?: DbMenu) => {
    if (!item) return;
    ids.add(item.id);
    item.children?.forEach(walk);
  };

  walk(menu ?? undefined);
  return ids;
}

function toParentTree(menus: DbMenu[], excludedIds: Set<number>): TreeSelectNode[] {
  return menus.flatMap((menu) => {
    if (excludedIds.has(menu.id) || menu.menuType === 2) {
      return [];
    }

    return [
      {
        title: menu.menuName,
        value: menu.id,
        key: menu.id,
        children: toParentTree(menu.children ?? [], excludedIds),
      },
    ];
  });
}

function menuTypeLabel(type: MenuType) {
  if (type === 0) return "目录";
  if (type === 1) return "菜单";
  return "按钮";
}

export function MenuModal({
  open,
  mode,
  menus,
  record,
  initialParentId = 0,
  confirmLoading = false,
  onCancel,
  onSubmit,
}: MenuModalProps) {
  const [form] = Form.useForm<MenuFormValues>();
  const menuType = Form.useWatch("menuType", form) ?? 0;
  const isCreate = mode === "create";

  const parentTreeData = useMemo(() => {
    const excludedIds = collectNodeIds(record);
    return [
      {
        title: "顶级菜单",
        value: 0,
        key: 0,
        children: toParentTree(menus, excludedIds),
      },
    ];
  }, [menus, record]);

  useEffect(() => {
    if (!open) return;

    form.resetFields();
    if (isCreate) {
      form.setFieldsValue({
        parentId: initialParentId,
        menuType: 1,
        orderNum: 1,
        status: 1,
      });
      return;
    }

    if (record) {
      form.setFieldsValue({
        parentId: record.parentId ?? 0,
        menuName: record.menuName,
        path: record.path,
        component: record.component ?? undefined,
        icon: record.icon ?? undefined,
        menuType: record.menuType,
        permission: record.permission ?? undefined,
        orderNum: record.orderNum,
        status: record.status,
      });
    }
  }, [form, initialParentId, isCreate, open, record]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
    } catch {
      // 表单校验信息由 Form 展示；接口错误由统一请求层展示。
    }
  };

  return (
    <Modal
      title={isCreate ? "新增菜单" : "编辑菜单"}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      width={700}
      centered
      destroyOnHidden
      className="menu-modal"
      okText="确定"
      cancelText="取消"
    >
      <Form form={form} layout="vertical" className="menu-modal-form">
        <Form.Item label="菜单类型" name="menuType" rules={[{ required: true, message: "请选择菜单类型" }]}>
          <Radio.Group optionType="button" buttonStyle="solid" className="menu-type-radio">
            {[0, 1, 2].map((type) => (
              <Radio.Button key={type} value={type} disabled={type === 2 && Boolean(record?.children?.length)}>
                {menuTypeLabel(type as MenuType)}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>

        <div className="menu-modal-grid">
          <Form.Item label="上级菜单" name="parentId" rules={[{ required: true, message: "请选择上级菜单" }]}>
            <TreeSelect treeData={parentTreeData} treeDefaultExpandAll placeholder="请选择上级菜单" />
          </Form.Item>

          <Form.Item
            label="菜单名称"
            name="menuName"
            rules={[
              { required: true, message: "请输入菜单名称" },
              { max: 50, message: "菜单名称不能超过 50 个字符" },
            ]}
          >
            <Input placeholder="例如：菜单管理" allowClear />
          </Form.Item>

          {menuType !== 2 ? (
            <Form.Item
              label="路由地址"
              name="path"
              tooltip="顶级菜单建议以 / 开头，子菜单填写相对路径"
              rules={[{ required: true, message: "请输入路由地址" }]}
            >
              <Input placeholder={menuType === 0 ? "例如：/system" : "例如：menu"} allowClear />
            </Form.Item>
          ) : null}

          {menuType === 1 ? (
            <Form.Item
              label="组件路径"
              name="component"
              tooltip="相对于 src/pages 的目录，不包含 index.tsx"
              rules={[{ required: true, message: "请输入组件路径" }]}
            >
              <Input placeholder="例如：System/MenuManagement" allowClear />
            </Form.Item>
          ) : null}

          {menuType !== 2 ? (
            <Form.Item label="菜单图标" name="icon">
              <MenuIconPicker />
            </Form.Item>
          ) : null}

          {menuType !== 0 ? (
            <Form.Item
              label="权限标识"
              name="permission"
              rules={menuType === 2 ? [{ required: true, message: "请输入权限标识" }] : undefined}
            >
              <Input placeholder="例如：system:menu:list" allowClear />
            </Form.Item>
          ) : null}

          <Form.Item label="显示排序" name="orderNum" rules={[{ required: true, message: "请输入显示排序" }]}>
            <InputNumber min={0} max={9999} precision={0} placeholder="数字越小越靠前" className="menu-order-input" />
          </Form.Item>

          <Form.Item label="状态" name="status" rules={[{ required: true, message: "请选择状态" }]}>
            <Radio.Group>
              <Radio value={1}>启用</Radio>
              <Radio value={0}>停用</Radio>
            </Radio.Group>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
