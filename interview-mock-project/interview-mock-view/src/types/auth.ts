export type UserInfo = {
  userId: number;
  username: string;
  roles: string[];
  permissions: string[];
};

export type LoginResponse = {
  accessToken: string;
  expiresIn: number;
  userInfo: UserInfo;
};
