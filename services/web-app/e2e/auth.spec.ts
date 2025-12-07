import { test, expect } from "@playwright/test";

test.describe("Auth Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto("/");
  });

  test("should display login page when not authenticated", async ({ page }) => {
    // Should redirect to login page
    await expect(page).toHaveURL(/login/);
    
    // Should display login form
    await expect(page.getByRole("heading", { name: /entrar|login/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/senha|password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /entrar|login/i })).toBeVisible();
  });

  test("should show validation errors for empty form submission", async ({ page }) => {
    await page.goto("/login");
    
    // Click login button without filling form
    await page.getByRole("button", { name: /entrar|login/i }).click();
    
    // Should show validation errors
    await expect(page.getByText(/obrigatório|required/i).first()).toBeVisible();
  });

  test("should show error message for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    
    // Fill in invalid credentials
    await page.getByLabel(/email/i).fill("invalid@example.com");
    await page.getByLabel(/senha|password/i).fill("wrongpassword");
    
    // Submit the form
    await page.getByRole("button", { name: /entrar|login/i }).click();
    
    // Should show error message (network error or invalid credentials)
    await expect(
      page.getByText(/inválido|erro|error|incorreto|unauthorized/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("should have link to register page", async ({ page }) => {
    await page.goto("/login");
    
    // Should have link to register
    const registerLink = page.getByRole("link", { name: /cadastrar|criar conta|register|sign up/i });
    await expect(registerLink).toBeVisible();
    
    // Click and navigate to register
    await registerLink.click();
    await expect(page).toHaveURL(/register|cadastro/);
  });

  test("should display register page correctly", async ({ page }) => {
    await page.goto("/register");
    
    // Should display register form
    await expect(page.getByRole("heading", { name: /cadastr|register|criar/i })).toBeVisible();
    await expect(page.getByLabel(/nome|name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/senha|password/i).first()).toBeVisible();
  });
});

test.describe("Auth Flow - With Backend", () => {
  // These tests require the backend to be running
  // Skip them if backend is not available
  
  test.skip("should login successfully with valid credentials", async ({ page }) => {
    // This test requires a running backend and valid credentials
    await page.goto("/login");
    
    // Fill in valid credentials (test user should exist)
    await page.getByLabel(/email/i).fill("admin@example.com");
    await page.getByLabel(/senha|password/i).fill("Admin@123");
    
    // Submit the form
    await page.getByRole("button", { name: /entrar|login/i }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL("/", { timeout: 10000 });
    
    // Should see dashboard content
    await expect(page.getByText(/dashboard|painel/i).first()).toBeVisible();
  });

  test.skip("should logout successfully", async ({ page }) => {
    // This test requires authentication first
    await page.goto("/login");
    
    // Login first
    await page.getByLabel(/email/i).fill("admin@example.com");
    await page.getByLabel(/senha|password/i).fill("Admin@123");
    await page.getByRole("button", { name: /entrar|login/i }).click();
    
    // Wait for dashboard
    await expect(page).toHaveURL("/", { timeout: 10000 });
    
    // Click on user menu or logout button
    await page.getByRole("button", { name: /sair|logout|menu/i }).click();
    
    // If there's a dropdown, click logout option
    const logoutOption = page.getByRole("menuitem", { name: /sair|logout/i });
    if (await logoutOption.isVisible()) {
      await logoutOption.click();
    }
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });
});
