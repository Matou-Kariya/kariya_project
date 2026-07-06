import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  token: string | null;
  userInfo: {
    id?: string;
    username?: string;
    avatar?: string;
    roles?: string[];
  } | null;
}

// 从 localStorage 读取初始状态
const loadState = (): UserState => {
  const token = localStorage.getItem("token");
  const userInfo = localStorage.getItem("userInfo");
  return {
    token,
    userInfo: userInfo ? JSON.parse(userInfo) : null,
  };
};

const initialState: UserState = loadState();

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
    setUserInfo: (state, action: PayloadAction<UserState["userInfo"]>) => {
      state.userInfo = action.payload;
      if (action.payload) {
        localStorage.setItem("userInfo", JSON.stringify(action.payload));
      }
    },
    logout: (state) => {
      state.token = null;
      state.userInfo = null;
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
    },
  },
});

export const { setToken, setUserInfo, logout } = userSlice.actions;
export default userSlice.reducer;
