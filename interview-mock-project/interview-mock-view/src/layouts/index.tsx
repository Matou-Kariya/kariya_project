import { useState } from "react";
import { Layout } from "antd";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { TagsView } from "./components/TagsView";
import { AppMain } from "./components/AppMain";
import "./index.css";

export function BasicLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="basic-layout">
      <Sidebar collapsed={collapsed} />
      <Layout className="basic-layout__right">
        <Navbar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <TagsView />
        <AppMain />
      </Layout>
    </Layout>
  );
}
