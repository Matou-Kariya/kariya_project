import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 48, minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Result
        status="404"
        title="页面不存在"
        subTitle="当前菜单对应的页面还没有创建，或访问地址不存在。"
        extra={
          <Button type="primary" onClick={() => navigate("/dashboard", { replace: true })}>
            返回仪表盘
          </Button>
        }
      />
    </div>
  );
}
