import { TokenExpirationGuard } from "@/components/auth/token-expiration-guard";
import { Toaster } from "@/components/ui/sonner";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { type AuthContextType } from "@/contexts/auth-context";

interface RouterContext {
  auth: AuthContextType;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <TokenExpirationGuard />
      <Outlet />
      <Toaster />
    </>
  );
}
