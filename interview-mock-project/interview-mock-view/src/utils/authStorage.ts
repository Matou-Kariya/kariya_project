const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const REMEMBER_ME_KEY = "rememberMe";
const USER_INFO_KEY = "userInfo";

export function saveAuthTokens(accessToken: string, refreshToken: string, rememberMe: boolean) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REMEMBER_ME_KEY, String(rememberMe));

  if (rememberMe) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } else {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveUserInfo<T>(userInfo: T) {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
}

export function getUserInfo<T>() {
  const raw = localStorage.getItem(USER_INFO_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearAuthTokens() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(REMEMBER_ME_KEY);
  localStorage.removeItem(USER_INFO_KEY);
}
