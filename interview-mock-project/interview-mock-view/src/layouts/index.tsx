import { useState } from "react";
import { Layout } from "antd";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { TagsView } from "./components/TagsView";
import { AppMain } from "./components/AppMain";
import "./index.css";

type BasicLayoutProps = {
  fallback?: React.ReactNode;
};

export function BasicLayout({ fallback }: BasicLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="basic-layout">
      <Sidebar collapsed={collapsed} />
      <Layout className="basic-layout__right">
        <Navbar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <TagsView />
        <AppMain>{fallback}</AppMain>
      </Layout>
    </Layout>
  );
}
