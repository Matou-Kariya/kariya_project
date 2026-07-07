import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "@/store";
import { App as AntdApp, ConfigProvider } from "antd";
import App from "./App";
import "./styles/global.css";
import zhCN from "antd/locale/zh_CN";
import { AntdRegistry } from "@/providers/AntdRegistry";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: "#1677ff" } }}>
        <AntdApp>
          <AntdRegistry>
            <App />
          </AntdRegistry>
        </AntdApp>
      </ConfigProvider>
    </Provider>
  </React.StrictMode>,
);
