import { useEffect } from "react";
import { useAuth } from "./use-auth";
import { decodeJWT } from "@/utils/jwt";
import { authToasts } from "@/utils/toast";

export function useTokenExpiration() {
  const { token, signOut } = useAuth();

  useEffect(() => {
    if (!token) {
      return;
    }

    const decoded = decodeJWT(token);

    if (!decoded || !decoded.exp) {
      return;
    }

    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;

    if (timeUntilExpiration <= 0) {
      authToasts.sessionExpired();

      (async () => {
        await signOut();
      })();

      return;
    }

    const timerId = setTimeout(async () => {
      authToasts.sessionExpired();
      await signOut();
    }, timeUntilExpiration + 1000);

    return () => {
      clearTimeout(timerId);
    };
  }, [token, signOut]);
}
