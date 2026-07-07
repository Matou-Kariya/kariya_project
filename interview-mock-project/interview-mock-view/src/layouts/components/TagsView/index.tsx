import { Tabs } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import "./index.css";

export function TagsView() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="tags-view">
      <Tabs
        size="small"
        activeKey={location.pathname}
        onChange={(key) => navigate(key)}
        items={[
          {
            key: location.pathname,
            label: "当前页面",
            closable: false,
          },
        ]}
      />
    </div>
  );
}
