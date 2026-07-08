const ACCESS_TOKEN_KEY = "accessToken";
const USER_INFO_KEY = "userInfo";

export function saveAccessToken(accessToken: string) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function saveUserInfo<T>(userInfo: T) {
  sessionStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
}

export function getUserInfo<T>() {
  const raw = sessionStorage.getItem(USER_INFO_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearAuthTokens() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(USER_INFO_KEY);
}
