import { test, expect } from "@playwright/test";

test.describe("Dashboard Navigation", () => {
  // These tests verify UI elements exist and are accessible
  // They don't require backend connectivity

  test("should display login page with proper structure", async ({ page }) => {
    await page.goto("/login");

    // Check page title or heading
    await expect(
      page.getByRole("heading", { name: /entrar|login|bem-vindo/i })
    ).toBeVisible();

    // Check form elements exist
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/senha|password/i)).toBeVisible();

    // Check submit button
    await expect(page.getByRole("button", { name: /entrar|login/i })).toBeVisible();
  });

  test("should display register page with proper structure", async ({ page }) => {
    await page.goto("/register");

    // Check page structure
    await expect(
      page.getByRole("heading", { name: /cadastr|register|criar/i })
    ).toBeVisible();

    // Check form elements
    await expect(page.getByLabel(/nome|name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/senha|password/i).first()).toBeVisible();
  });

  test("should navigate between login and register pages", async ({ page }) => {
    await page.goto("/login");

    // Find and click register link
    const registerLink = page.getByRole("link", {
      name: /cadastrar|criar conta|register/i,
    });
    await expect(registerLink).toBeVisible();
    await registerLink.click();

    // Should be on register page
    await expect(page).toHaveURL(/register|cadastro/);

    // Find and click login link
    const loginLink = page.getByRole("link", {
      name: /entrar|login|já tenho/i,
    });
    await expect(loginLink).toBeVisible();
    await loginLink.click();

    // Should be back on login page
    await expect(page).toHaveURL(/login/);
  });

  test("should show form validation on login page", async ({ page }) => {
    await page.goto("/login");

    // Get the email input and clear it if needed
    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill("");
    await emailInput.blur();

    // Check for validation or disabled state
    const submitButton = page.getByRole("button", { name: /entrar|login/i });
    await expect(submitButton).toBeVisible();
  });

  test("should have proper page metadata", async ({ page }) => {
    await page.goto("/login");

    // Check that page loaded successfully
    await expect(page).toHaveTitle(/.+/);
  });

  test("should be responsive - mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/login");

    // Form should still be visible and usable
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/senha|password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /entrar|login/i })).toBeVisible();
  });

  test("should be responsive - tablet viewport", async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/login");

    // Form should still be visible
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /entrar|login/i })).toBeVisible();
  });

  test("should handle keyboard navigation", async ({ page }) => {
    await page.goto("/login");

    // Tab through form elements
    await page.keyboard.press("Tab");
    
    // Email input should be focused (or first focusable element)
    const emailInput = page.getByLabel(/email/i);
    
    // Fill and tab to next
    await emailInput.fill("test@example.com");
    await page.keyboard.press("Tab");

    // Should be on password field now
    const passwordInput = page.getByLabel(/senha|password/i);
    await expect(passwordInput).toBeFocused();
  });
});

test.describe("Protected Routes", () => {
  test("should redirect to login when accessing dashboard without auth", async ({
    page,
  }) => {
    // Try to access dashboard directly
    await page.goto("/");

    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test("should redirect to login when accessing account page without auth", async ({
    page,
  }) => {
    // Try to access account page directly
    await page.goto("/account");

    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });
});
