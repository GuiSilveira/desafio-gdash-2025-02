import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { authToasts } from "@/utils/toast";
import { useNavigate } from "@tanstack/react-router";

export function TokenExpirationGuard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.exp) {
      return;
    }

    const expirationTime = user.exp * 1000;
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;

    if (timeUntilExpiration <= 0) {
      console.warn("Token has already expired");
      return;
    }

    const timerId = setTimeout(async () => {
      console.warn("Token expired, signing out automatically");
      authToasts.sessionExpired();
      await signOut();
      await navigate({ to: "/login" });
    }, timeUntilExpiration);

    return () => {
      clearTimeout(timerId);
    };
  }, [user?.exp, signOut, navigate]);

  return null;
}
