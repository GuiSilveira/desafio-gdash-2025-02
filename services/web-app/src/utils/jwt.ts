import type { UserPayload } from "@/types/auth";

export function decodeJWT(token: string): UserPayload | null {
  try {
    const base64Url = token.split(".")[1];

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Falha ao decodificar JWT:", error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload) return true;

  const now = Date.now() / 1000;
  return payload.exp < now;
}

export function getTokenExpirationTime(token: string): number {
  const payload = decodeJWT(token);
  if (!payload) return 0;

  const now = Date.now() / 1000;
  const remaining = (payload.exp - now) * 1000;
  return Math.max(0, remaining);
}
