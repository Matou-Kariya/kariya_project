import { Outlet } from "react-router-dom";
import "./index.css";

type AppMainProps = {
  children?: React.ReactNode;
};
export function AppMain({ children }: AppMainProps) {
  return <main className="app-main">{children ?? <Outlet />}</main>;
}
