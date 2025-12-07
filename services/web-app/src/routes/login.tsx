import LoginPage from "@/features/auth/login-page";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  beforeLoad: async ({ context, location }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({
        to: "/",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: LoginPage,
  pendingComponent: () => <Loader2 className="animate-spin" />,
  errorComponent: ({ error }) => (
    <div className="p-4 bg-red-100 text-red-800 rounded">
      <h1 className="text-xl font-bold mb-2">Error Loading Login Page</h1>
      <p>{error.message}</p>
    </div>
  ),
});
