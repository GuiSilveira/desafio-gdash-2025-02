import { test, expect } from "@playwright/test";

test.describe("Users Page", () => {
  test.describe("Access Control", () => {
    test("should redirect to login when not authenticated", async ({ page }) => {
      await page.goto("/users");
      await expect(page).toHaveURL(/login/);
    });

    test("should redirect to home when user is not admin", async ({ page }) => {
      // Mock non-admin user
      await page.addInitScript(() => {
        const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
        const payload = btoa(
          JSON.stringify({
            sub: "user-123",
            email: "user@example.com",
            name: "Regular User",
            roles: ["user"], // Not admin
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

      await page.goto("/users");
      
      // Should redirect to home (not users page)
      await expect(page).not.toHaveURL(/users/);
    });
  });

  test.describe("Admin Access", () => {
    const mockUsers = [
      {
        _id: "user-1",
        name: "John Doe",
        email: "john@example.com",
        roles: ["user"],
        createdAt: "2024-01-15T10:30:00Z",
      },
      {
        _id: "user-2",
        name: "Jane Smith",
        email: "jane@example.com",
        roles: ["admin"],
        createdAt: "2024-02-20T14:45:00Z",
      },
      {
        _id: "user-3",
        name: "Bob Wilson",
        email: "bob@example.com",
        roles: ["user"],
        createdAt: "2024-03-10T09:00:00Z",
      },
    ];

    test.beforeEach(async ({ page }) => {
      // Mock admin user
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

      // Mock users API
      await page.route("**/api/users**", (route) => {
        if (route.request().method() === "GET") {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              data: mockUsers,
              total: 3,
              page: 1,
              totalPages: 1,
            }),
          });
        } else if (route.request().method() === "POST") {
          route.fulfill({
            status: 201,
            contentType: "application/json",
            body: JSON.stringify({
              _id: "new-user",
              name: "New User",
              email: "newuser@example.com",
              roles: ["user"],
            }),
          });
        } else if (route.request().method() === "PATCH") {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockUsers[0]),
          });
        } else if (route.request().method() === "DELETE") {
          route.fulfill({
            status: 204,
            body: "",
          });
        } else {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({}),
          });
        }
      });

      // Mock other API calls
      await page.route("**/api/weather**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({}),
        });
      });
    });

    test("should display users page heading", async ({ page }) => {
      await page.goto("/users");
      await page.waitForLoadState("networkidle");
      
      // Should show "Gerenciar Usuários" title
      await expect(page.getByText(/gerenciar usuários/i)).toBeVisible();
    });

    test("should display users count", async ({ page }) => {
      await page.goto("/users");
      await page.waitForLoadState("networkidle");
      
      // Should show users count
      await expect(page.getByText(/3 usuários cadastrados/i)).toBeVisible();
    });

    test("should display 'Novo Usuário' button", async ({ page }) => {
      await page.goto("/users");
      await page.waitForLoadState("networkidle");
      
      await expect(
        page.getByRole("button", { name: /novo usuário/i })
      ).toBeVisible();
    });

    test("should display users in table", async ({ page }) => {
      await page.goto("/users");
      await page.waitForLoadState("networkidle");
      
      // Should display user names
      await expect(page.getByText("John Doe")).toBeVisible();
      await expect(page.getByText("Jane Smith")).toBeVisible();
      await expect(page.getByText("Bob Wilson")).toBeVisible();
    });

    test("should display user emails in table", async ({ page }) => {
      await page.goto("/users");
      await page.waitForLoadState("networkidle");
      
      await expect(page.getByText("john@example.com")).toBeVisible();
      await expect(page.getByText("jane@example.com")).toBeVisible();
    });

    test("should display role badges", async ({ page }) => {
      await page.goto("/users");
      await page.waitForLoadState("networkidle");
      
      // Should have role badges (Admin and Usuário)
      await expect(page.getByText("Admin")).toBeVisible();
      // At least one "Usuário" badge
      const userBadges = page.getByText("Usuário", { exact: true });
      expect(await userBadges.count()).toBeGreaterThan(0);
    });

    test("should have table headers", async ({ page }) => {
      await page.goto("/users");
      await page.waitForLoadState("networkidle");
      
      await expect(page.getByRole("columnheader", { name: /nome/i })).toBeVisible();
      await expect(page.getByRole("columnheader", { name: /email/i })).toBeVisible();
      await expect(page.getByRole("columnheader", { name: /função/i })).toBeVisible();
      await expect(page.getByRole("columnheader", { name: /criado em/i })).toBeVisible();
      await expect(page.getByRole("columnheader", { name: /ações/i })).toBeVisible();
    });

    test("should have edit buttons for each user", async ({ page }) => {
      await page.goto("/users");
      await page.waitForLoadState("networkidle");
      
      // Should have edit buttons (pencil icons)
      const editButtons = page.locator('button:has(svg.lucide-pencil)');
      expect(await editButtons.count()).toBe(3);
    });

    test("should have delete buttons for each user", async ({ page }) => {
      await page.goto("/users");
      await page.waitForLoadState("networkidle");
      
      // Should have delete buttons (trash icons)
      const deleteButtons = page.locator('button:has(svg.lucide-trash-2)');
      expect(await deleteButtons.count()).toBe(3);
    });

    test("should open create user dialog when clicking 'Novo Usuário'", async ({
      page,
    }) => {
      await page.goto("/users");
      await page.waitForLoadState("networkidle");
      
      await page.getByRole("button", { name: /novo usuário/i }).click();
      
      // Dialog should open
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(
        page.getByRole("heading", { name: /criar usuário|novo usuário/i })
      ).toBeVisible();
    });

    test("should have form fields in create dialog", async ({ page }) => {
      await page.goto("/users");
      await page.waitForLoadState("networkidle");
      
      await page.getByRole("button", { name: /novo usuário/i }).click();
      
      // Form fields should be present
      await expect(page.getByLabel(/nome/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/senha/i)).toBeVisible();
    });

    test("should open edit dialog when clicking edit button", async ({ page }) => {
      await page.goto("/users");
      await page.waitForLoadState("networkidle");
      
      // Click first edit button
      const editButtons = page.locator('button:has(svg.lucide-pencil)');
      await editButtons.first().click();
      
      // Dialog should open
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(
        page.getByRole("heading", { name: /editar usuário/i })
      ).toBeVisible();
    });

    test("should open delete confirmation when clicking delete button", async ({
      page,
    }) => {
      await page.goto("/users");
      await page.waitForLoadState("networkidle");
      
      // Click first delete button
      const deleteButtons = page.locator('button:has(svg.lucide-trash-2)');
      await deleteButtons.first().click();
      
      // Confirmation dialog should open
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByText(/excluir|deletar|confirmar/i)).toBeVisible();
    });

    test("should be responsive on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/users");
      await page.waitForLoadState("networkidle");
      
      // Table should still be accessible (may be scrollable)
      await expect(page.getByText(/gerenciar usuários/i)).toBeVisible();
    });

    test("should be responsive on tablet", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto("/users");
      await page.waitForLoadState("networkidle");
      
      await expect(page.getByText(/gerenciar usuários/i)).toBeVisible();
    });
  });

  test.describe("Empty State", () => {
    test.beforeEach(async ({ page }) => {
      // Mock admin user
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

      // Mock empty users list
      await page.route("**/api/users**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: [],
            total: 0,
            page: 1,
            totalPages: 0,
          }),
        });
      });

      await page.route("**/api/weather**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({}),
        });
      });
    });

    test("should display empty state message", async ({ page }) => {
      await page.goto("/users");
      await page.waitForLoadState("networkidle");
      
      await expect(page.getByText(/nenhum usuário encontrado/i)).toBeVisible();
    });

    test("should display instruction to add user", async ({ page }) => {
      await page.goto("/users");
      await page.waitForLoadState("networkidle");
      
      await expect(
        page.getByText(/clique em 'novo usuário' para adicionar/i)
      ).toBeVisible();
    });
  });
});
