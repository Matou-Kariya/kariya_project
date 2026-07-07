import { App as AntdApp } from "antd";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { registerMessage } from "@/services/antd";

type Props = {
  children: ReactNode;
};

export const AntdRegistry = ({ children }: Props) => {
  const { message } = AntdApp.useApp();

  useEffect(() => {
    registerMessage(message);
  }, [message]);

  return children;
};
