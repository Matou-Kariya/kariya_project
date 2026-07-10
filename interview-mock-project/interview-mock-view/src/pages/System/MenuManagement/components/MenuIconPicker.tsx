import { Button, Empty, Input, Modal, Space } from "antd";
import { AppstoreOutlined, CheckOutlined, SearchOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import { getMenuIcon, menuIconOptions } from "@/constants/menuIcons";
import "./MenuIconPicker.css";

type MenuIconPickerProps = {
  value?: string;
  onChange?: (value?: string) => void;
};

export function MenuIconPicker({ value, onChange }: MenuIconPickerProps) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [draftValue, setDraftValue] = useState<string | undefined>(value);

  const selectedOption = menuIconOptions.find((option) => option.value === value);
  const filteredOptions = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return menuIconOptions;

    return menuIconOptions.filter(
      (option) => option.label.toLowerCase().includes(normalized) || option.value.toLowerCase().includes(normalized),
    );
  }, [keyword]);

  const showPicker = () => {
    setDraftValue(value);
    setKeyword("");
    setOpen(true);
  };

  const confirmSelection = () => {
    onChange?.(draftValue);
    setOpen(false);
  };

  return (
    <>
      <button type="button" className="menu-icon-picker-trigger" onClick={showPicker}>
        <span className={`menu-icon-picker-trigger__preview${value ? " is-selected" : ""}`}>
          {getMenuIcon(value) ?? <AppstoreOutlined />}
        </span>
        <span className="menu-icon-picker-trigger__text">
          <strong>{selectedOption?.label ?? (value || "选择菜单图标")}</strong>
          <small>{value || "点击打开图标面板"}</small>
        </span>
        <span className="menu-icon-picker-trigger__action">选择</span>
      </button>

      <Modal
        title="选择菜单图标"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={confirmSelection}
        width={760}
        centered
        destroyOnHidden
        className="menu-icon-picker-modal"
        okText="确定"
        cancelText="取消"
      >
        <div className="menu-icon-picker-toolbar">
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            prefix={<SearchOutlined />}
            placeholder="搜索图标名称，例如：用户、UserOutlined"
            allowClear
          />
          <Button onClick={() => setDraftValue(undefined)}>清除选择</Button>
        </div>

        {filteredOptions.length ? (
          <div className="menu-icon-picker-grid">
            {filteredOptions.map((option) => {
              const selected = draftValue === option.value;
              return (
                <button
                  type="button"
                  key={option.value}
                  className={`menu-icon-picker-item${selected ? " is-selected" : ""}`}
                  onClick={() => setDraftValue(option.value)}
                  title={option.value}
                >
                  <span className="menu-icon-picker-item__icon">{getMenuIcon(option.value)}</span>
                  <span className="menu-icon-picker-item__label">{option.label}</span>
                  <small>{option.value}</small>
                  {selected ? <CheckOutlined className="menu-icon-picker-item__check" /> : null}
                </button>
              );
            })}
          </div>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="没有匹配的图标" />
        )}

        <div className="menu-icon-picker-summary">
          <Space size={8}>
            <span>当前选择：</span>
            <span className="menu-icon-picker-summary__icon">{getMenuIcon(draftValue) ?? <AppstoreOutlined />}</span>
            <strong>{draftValue || "未选择"}</strong>
          </Space>
        </div>
      </Modal>
    </>
  );
}
