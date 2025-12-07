import { createContext, useState, useCallback } from "react";
import { decodeJWT } from "@/utils/jwt";
import { authToasts } from "@/utils/toast";
import { tokenStorage } from "@/utils/storage";
import { api } from "@/config/api";
import type { UserPayload, AuthContextType } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    token: string | null;
    user: UserPayload | null;
  }>(() => {
    const storedToken = tokenStorage.get();

    if (storedToken) {
      const decoded = decodeJWT(storedToken);

      if (decoded && decoded.exp && decoded.exp > Date.now() / 1000) {
        return {
          token: storedToken,
          user: decoded,
        };
      } else {
        tokenStorage.remove();
        authToasts.sessionExpiredOnLoad();
      }
    }

    return {
      token: null,
      user: null,
    };
  });

  const isAuthenticated = !!state.token;

  const signOut = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.warn("Failed to call backend logout:", error);
    }

    tokenStorage.remove();
    setState({ token: null, user: null });
    authToasts.logoutSuccess();
  }, []);

  const signIn = useCallback((newToken: string) => {
    const decoded = decodeJWT(newToken);

    if (!decoded || !decoded.exp) {
      console.error("Invalid token structure");
      authToasts.invalidToken();
      return false;
    }

    if (decoded.exp < Date.now() / 1000) {
      console.warn("Cannot sign in with expired token");
      authToasts.tokenExpired();
      return false;
    }

    tokenStorage.set(newToken);
    setState({
      token: newToken,
      user: decoded,
    });
    authToasts.loginSuccess(decoded.name || decoded.email);

    return true;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token: state.token,
        user: state.user,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
export type { AuthContextType } from "@/types/auth";
