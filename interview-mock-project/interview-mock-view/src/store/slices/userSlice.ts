import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { DbMenu } from "@/types/menu";
import type { UserInfo } from "@/types/auth";

type UserState = {
  token: string | null;
  userInfo: UserInfo | null;
  menus: DbMenu[];
  permissions: string[];
};

const initialState: UserState = {
  token: null,
  userInfo: null,
  menus: [],
  permissions: [],
};

function collectPermissions(menus: DbMenu[]) {
  const permissions = new Set<string>();

  const walk = (items: DbMenu[]) => {
    items.forEach((item) => {
      if (item.permission) permissions.add(item.permission);
      if (item.children?.length) walk(item.children);
    });
  };

  walk(menus);
  return [...permissions];
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    setUserInfo(state, action: PayloadAction<UserInfo | null>) {
      state.userInfo = action.payload;
    },
    setMenus(state, action: PayloadAction<DbMenu[]>) {
      state.menus = action.payload;
      state.permissions = collectPermissions(action.payload);
    },
    logout(state) {
      state.token = null;
      state.userInfo = null;
      state.menus = [];
      state.permissions = [];
    },
  },
});

export const { setToken, setUserInfo, setMenus, logout } = userSlice.actions;
export default userSlice.reducer;
