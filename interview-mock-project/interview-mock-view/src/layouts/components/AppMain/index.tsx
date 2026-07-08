import { Outlet } from "react-router-dom";
import "./index.css";

export function AppMain() {
  return (
    <main className="app-main">
      <Outlet />
    </main>
  );
}
