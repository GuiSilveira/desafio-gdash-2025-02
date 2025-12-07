import { test, expect } from "@playwright/test";

test.describe("Account Page", () => {
  test.describe("Without Authentication", () => {
    test("should redirect to login when accessing account without auth", async ({
      page,
    }) => {
      await page.goto("/account");
      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe("With Authentication", () => {
    const mockUser = {
      sub: "user-123",
      email: "testuser@example.com",
      name: "Test User",
      roles: ["user"],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    test.beforeEach(async ({ page }) => {
      // Mock authentication
      await page.addInitScript((user) => {
        const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
        const payload = btoa(JSON.stringify(user));
        const token = `${header}.${payload}.mock-signature`;
        localStorage.setItem("@gdash:token", token);
      }, mockUser);

      // Mock API calls
      await page.route("**/api/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({}),
        });
      });
    });

    test("should display account page heading", async ({ page }) => {
      await page.goto("/account");
      await page.waitForLoadState("networkidle");
      
      // Should show "Minha Conta" heading
      await expect(
        page.getByRole("heading", { name: /minha conta|my account/i })
      ).toBeVisible();
    });

    test("should display user name", async ({ page }) => {
      await page.goto("/account");
      await page.waitForLoadState("networkidle");
      
      // Should display user's name
      await expect(page.getByText("Test User")).toBeVisible();
    });

    test("should display user email", async ({ page }) => {
      await page.goto("/account");
      await page.waitForLoadState("networkidle");
      
      // Should display user's email
      await expect(page.getByText("testuser@example.com")).toBeVisible();
    });

    test("should display user ID", async ({ page }) => {
      await page.goto("/account");
      await page.waitForLoadState("networkidle");
      
      // Should display user ID
      await expect(page.getByText("user-123")).toBeVisible();
    });

    test("should display profile section", async ({ page }) => {
      await page.goto("/account");
      await page.waitForLoadState("networkidle");
      
      // Should have Profile section
      await expect(
        page.getByRole("heading", { name: /perfil|profile/i })
      ).toBeVisible();
    });

    test("should display session information section", async ({ page }) => {
      await page.goto("/account");
      await page.waitForLoadState("networkidle");
      
      // Should have Session Information section
      await expect(
        page.getByText(/informações da sessão|session information/i)
      ).toBeVisible();
    });

    test("should display user avatar with initials", async ({ page }) => {
      await page.goto("/account");
      await page.waitForLoadState("networkidle");
      
      // Avatar should show initials (TU for Test User)
      await expect(page.getByText("TU")).toBeVisible();
    });

    test("should display 'Usuário Ativo' badge", async ({ page }) => {
      await page.goto("/account");
      await page.waitForLoadState("networkidle");
      
      // Should show active user badge
      await expect(page.getByText(/usuário ativo|active user/i)).toBeVisible();
    });

    test("should display token expiration information", async ({ page }) => {
      await page.goto("/account");
      await page.waitForLoadState("networkidle");
      
      // Should show token expiration label
      await expect(page.getByText(/token expira|token expires/i)).toBeVisible();
    });

    test("should be responsive on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/account");
      await page.waitForLoadState("networkidle");
      
      // Should still show main content
      await expect(page.getByText("Test User")).toBeVisible();
      await expect(page.getByText("testuser@example.com")).toBeVisible();
    });

    test("should be responsive on tablet", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto("/account");
      await page.waitForLoadState("networkidle");
      
      // Should still show main content
      await expect(page.getByText("Test User")).toBeVisible();
    });
  });

  test.describe("With Admin User", () => {
    test.beforeEach(async ({ page }) => {
      // Mock authentication with admin role
      await page.addInitScript(() => {
        const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
        const payload = btoa(
          JSON.stringify({
            sub: "admin-123",
            email: "admin@example.com",
            name: "Admin User",
            roles: ["admin"],
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600,
          })
        );
        const token = `${header}.${payload}.mock-signature`;
        localStorage.setItem("@gdash:token", token);
      });

      await page.route("**/api/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({}),
        });
      });
    });

    test("should display admin user information", async ({ page }) => {
      await page.goto("/account");
      await page.waitForLoadState("networkidle");
      
      await expect(page.getByText("Admin User")).toBeVisible();
      await expect(page.getByText("admin@example.com")).toBeVisible();
    });
  });

  test.describe("Edge Cases", () => {
    test("should handle user without name", async ({ page }) => {
      await page.addInitScript(() => {
        const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
        const payload = btoa(
          JSON.stringify({
            sub: "user-no-name",
            email: "noname@example.com",
            // No name field
            roles: ["user"],
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600,
          })
        );
        const token = `${header}.${payload}.mock-signature`;
        localStorage.setItem("@gdash:token", token);
      });

      await page.route("**/api/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({}),
        });
      });

      await page.goto("/account");
      await page.waitForLoadState("networkidle");
      
      // Should show fallback text or email
      await expect(page.getByText("noname@example.com")).toBeVisible();
    });
  });
});
