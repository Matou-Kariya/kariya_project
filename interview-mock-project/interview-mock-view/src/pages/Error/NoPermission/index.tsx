import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

export default function NoPermission() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Result
        status="403"
        title="暂无访问权限"
        subTitle="你当前的账号没有访问该页面的权限，如需开通请联系管理员。"
        extra={
          <Button type="primary" onClick={() => navigate("/dashboard", { replace: true })}>
            返回仪表盘
          </Button>
        }
      />
    </div>
  );
}
