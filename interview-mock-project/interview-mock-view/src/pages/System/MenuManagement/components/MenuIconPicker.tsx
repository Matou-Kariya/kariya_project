import { AppstoreOutlined, CheckOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Empty, Input, Modal, Space } from "antd";
import { useDeferredValue, useMemo, useState } from "react";
import { getMenuIcon, menuIconCategories, menuIconOptions } from "@/constants/menuIcons";
import type { MenuIconCategory } from "@/constants/menuIcons";
import "./MenuIconPicker.css";

type MenuIconPickerProps = {
  value?: string;
  onChange?: (value?: string) => void;
};

type ActiveCategory = "all" | MenuIconCategory;

export function MenuIconPicker({ value, onChange }: MenuIconPickerProps) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>("all");
  const [draftValue, setDraftValue] = useState<string | undefined>(value);
  const deferredKeyword = useDeferredValue(keyword);

  const selectedOption = menuIconOptions.find((option) => option.value === value);
  const draftOption = menuIconOptions.find((option) => option.value === draftValue);

  const categoryCounts = useMemo(() => {
    return menuIconOptions.reduce<Record<string, number>>((counts, option) => {
      counts[option.category] = (counts[option.category] ?? 0) + 1;
      return counts;
    }, {});
  }, []);

  const filteredOptions = useMemo(() => {
    const normalized = deferredKeyword.trim().toLowerCase();

    return menuIconOptions.filter((option) => {
      const matchesCategory = activeCategory === "all" || option.category === activeCategory;

      if (!matchesCategory) return false;
      if (!normalized) return true;

      const categoryLabel = menuIconCategories.find((category) => category.value === option.category)?.label ?? "";
      const searchText = [option.label, option.value, categoryLabel, ...(option.keywords ?? [])]
        .join(" ")
        .toLowerCase();

      return searchText.includes(normalized);
    });
  }, [activeCategory, deferredKeyword]);

  const showPicker = () => {
    setDraftValue(value);
    setKeyword("");
    setActiveCategory("all");
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
        width={920}
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

        <div className="menu-icon-picker-categories" role="tablist" aria-label="图标分类">
          {menuIconCategories.map((category) => {
            const active = activeCategory === category.value;
            const count = category.value === "all" ? menuIconOptions.length : (categoryCounts[category.value] ?? 0);

            return (
              <button
                type="button"
                role="tab"
                aria-selected={active}
                key={category.value}
                className={`menu-icon-picker-category${active ? " is-active" : ""}`}
                onClick={() => setActiveCategory(category.value)}
              >
                <span>{category.label}</span>
                <small>{count}</small>
              </button>
            );
          })}
        </div>

        <div className="menu-icon-picker-result-bar">
          <span>
            找到 <strong>{filteredOptions.length}</strong> 个图标
          </span>
          <span>单击选择，双击可直接确认</span>
        </div>

        <div className="menu-icon-picker-viewport">
          {filteredOptions.length ? (
            <div className="menu-icon-picker-grid" role="listbox" aria-label="可选菜单图标">
              {filteredOptions.map((option) => {
                const selected = draftValue === option.value;

                return (
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    key={option.value}
                    className={`menu-icon-picker-item${selected ? " is-selected" : ""}`}
                    onClick={() => setDraftValue(option.value)}
                    onDoubleClick={() => {
                      onChange?.(option.value);
                      setOpen(false);
                    }}
                    title={`${option.label} · ${option.value}`}
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
            <div className="menu-icon-picker-empty">
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="没有匹配的图标，请尝试其他关键词" />
            </div>
          )}
        </div>

        <div className="menu-icon-picker-summary">
          <Space size={8}>
            <span>当前选择</span>
            <span className={`menu-icon-picker-summary__icon${draftValue ? " is-selected" : ""}`}>
              {getMenuIcon(draftValue) ?? <AppstoreOutlined />}
            </span>
            <span className="menu-icon-picker-summary__text">
              <strong>{draftOption?.label ?? "未选择"}</strong>
              <small>{draftValue || "保存后菜单将不显示自定义图标"}</small>
            </span>
          </Space>
        </div>
      </Modal>
    </>
  );
}
