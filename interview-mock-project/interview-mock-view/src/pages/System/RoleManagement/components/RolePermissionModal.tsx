import { ApartmentOutlined, CheckSquareOutlined, ClearOutlined } from "@ant-design/icons";
import { Alert, Modal, Space, Tree } from "antd";
import type { TreeDataNode, TreeProps } from "antd";
import type { Key } from "react";
import { useEffect, useMemo, useState } from "react";
import { getRoleMenuIdsApi, updateRoleMenusApi } from "@/api/role";
import type { RoleRecord } from "@/api/role";
import type { DbMenu } from "@/types/menu";
import { AppButton } from "@/components/AppButton";
import "./RolePermissionModal.css";

type RolePermissionModalProps = {
  open: boolean;
  role?: RoleRecord | null;
  menus: DbMenu[];
  onCancel: () => void;
  onSaved: () => void;
};

function toTreeData(menus: DbMenu[]): TreeDataNode[] {
  return menus.map((menu) => ({
    key: menu.id,
    title: <span className="role-permission-node"><strong>{menu.menuName}</strong><small>{menu.permission || (menu.menuType === 0 ? "目录" : "页面")}</small></span>,
    children: toTreeData(menu.children ?? []),
  }));
}

function collectKeys(menus: DbMenu[]): Key[] {
  return menus.flatMap((menu) => [menu.id, ...collectKeys(menu.children ?? [])]);
}

export function RolePermissionModal({ open, role, menus, onCancel, onSaved }: RolePermissionModalProps) {
  const [checkedKeys, setCheckedKeys] = useState<Key[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
  const [loading, setLoading] = useState(false);
  const treeData = useMemo(() => toTreeData(menus), [menus]);
  const allKeys = useMemo(() => collectKeys(menus), [menus]);
  const isAdmin = role?.roleKey === "admin";

  useEffect(() => {
    if (!open || !role) return;
    const timer = window.setTimeout(() => {
      setExpandedKeys(allKeys);
      if (isAdmin) setCheckedKeys(allKeys);
      else void getRoleMenuIdsApi(role.id).then((ids) => setCheckedKeys(ids));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [allKeys, isAdmin, open, role]);

  const handleCheck: TreeProps["onCheck"] = (keys) => {
    setCheckedKeys(Array.isArray(keys) ? keys : keys.checked);
  };

  const handleSave = async () => {
    if (!role || isAdmin) { onCancel(); return; }
    setLoading(true);
    try {
      await updateRoleMenusApi(role.id, checkedKeys.map(Number));
      onSaved();
      onCancel();
    } finally { setLoading(false); }
  };

  return (
    <Modal title={`角色授权 · ${role?.roleName ?? ""}`} open={open} onCancel={onCancel} onOk={handleSave} confirmLoading={loading} width={760} centered destroyOnHidden className="role-permission-modal" okText={isAdmin ? "我知道了" : "保存授权"} cancelText="取消">
      {isAdmin ? <Alert type="info" showIcon message="超级管理员始终拥有全部启用菜单和权限，无需单独保存授权关系。" /> : null}
      <div className="role-permission-toolbar">
        <Space><AppButton icon={<CheckSquareOutlined />} onClick={() => setCheckedKeys(allKeys)}>全选</AppButton><AppButton icon={<ClearOutlined />} onClick={() => setCheckedKeys([])}>清空</AppButton><AppButton icon={<ApartmentOutlined />} onClick={() => setExpandedKeys(expandedKeys.length ? [] : allKeys)}>{expandedKeys.length ? "折叠全部" : "展开全部"}</AppButton></Space>
        <span>已选择 {checkedKeys.length} 项</span>
      </div>
      <div className="role-permission-tree"><Tree checkable disabled={isAdmin} treeData={treeData} checkedKeys={checkedKeys} expandedKeys={expandedKeys} onExpand={setExpandedKeys} onCheck={handleCheck} /></div>
    </Modal>
  );
}
