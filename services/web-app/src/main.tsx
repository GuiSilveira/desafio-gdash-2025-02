import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/globals.css";
import { router } from "./config/router";
import { AuthProvider } from "./contexts/auth-context";
import { ThemeProvider } from "./contexts/theme-provider";
import { InnerApp } from "./components/layout/inner-app";
import { ErrorBoundary } from "./components/error-boundary";
import { createLogger } from "./utils/logger";

const appLogger = createLogger({ service: "web-app" });
appLogger.info("Application starting", { version: "1.0.0" });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary logger={appLogger}>
      <ThemeProvider>
        <AuthProvider>
          <InnerApp />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
