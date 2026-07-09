import { useMemo } from "react";
import { RouterProvider } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { createAppRouter } from "@/router";

function App() {
  const menus = useSelector((state: RootState) => state.user.menus);

  const router = useMemo(() => {
    return createAppRouter(menus);
  }, [menus]);

  return <RouterProvider router={router} />;
}

export default App;
