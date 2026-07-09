export function isJwtExpired(token?: string | null, skewSeconds = 60) {
  if (!token) return true;

  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return true;

    const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(window.atob(normalized));

    if (!payload.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now + skewSeconds;
  } catch {
    return true;
  }
}
