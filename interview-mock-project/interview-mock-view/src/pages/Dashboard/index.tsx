import { Card, Typography } from "antd";

const { Title } = Typography;

const Dashboard = () => {
  return (
    <Card>
      <Title level={3}>欢迎来到 AI 面试官后台</Title>
      <p>在这里你可以管理面试题、用户、面试记录等数据。</p>
    </Card>
  );
};

export default Dashboard;
