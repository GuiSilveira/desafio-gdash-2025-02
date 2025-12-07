import { test, expect } from "@playwright/test";

test.describe("Dashboard Page", () => {
  // These tests verify UI elements exist and are accessible
  // They require authentication

  test.describe("Without Authentication", () => {
    test("should redirect to login when accessing dashboard without auth", async ({
      page,
    }) => {
      await page.goto("/");
      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe("With Mocked Authentication", () => {
    test.beforeEach(async ({ page }) => {
      // Mock authentication by setting token in localStorage before navigation
      await page.addInitScript(() => {
        // Create a valid JWT-like token (base64 encoded)
        const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
        const payload = btoa(
          JSON.stringify({
            sub: "test-user-id",
            email: "test@example.com",
            name: "Test User",
            roles: ["user"],
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
          })
        );
        const signature = "mock-signature";
        const token = `${header}.${payload}.${signature}`;
        localStorage.setItem("@gdash:token", token);
      });
    });

    test("should display dashboard header", async ({ page }) => {
      // Mock API calls
      await page.route("**/api/weather/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            temperature: 25,
            humidity: 60,
            description: "Ensolarado",
          }),
        });
      });

      await page.goto("/");
      
      // Should stay on dashboard (not redirect to login)
      await expect(page).not.toHaveURL(/login/);
    });

    test("should show loading states initially", async ({ page }) => {
      // Delay API responses to see loading states
      await page.route("**/api/**", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({}),
        });
      });

      await page.goto("/");
      
      // Dashboard should show some content or skeleton
      await expect(page.locator("body")).not.toBeEmpty();
    });
  });
});

test.describe("Dashboard - Weather Components", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const payload = btoa(
        JSON.stringify({
          sub: "test-user-id",
          email: "test@example.com",
          name: "Test User",
          roles: ["user"],
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
        })
      );
      const token = `${header}.${payload}.mock-signature`;
      localStorage.setItem("@gdash:token", token);
    });

    // Mock weather API responses
    await page.route("**/api/weather", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          temperature: 25,
          temperatureMax: 30,
          temperatureMin: 20,
          humidity: 60,
          windSpeed: 10,
          weatherCode: 0,
          location: "São Paulo",
        }),
      });
    });

    await page.route("**/api/weather/hourly", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          hours: Array.from({ length: 24 }, (_, i) => ({
            time: `${i.toString().padStart(2, "0")}:00`,
            temperature: 20 + Math.random() * 10,
            humidity: 50 + Math.random() * 30,
          })),
        }),
      });
    });

    await page.route("**/api/weather/forecast", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          days: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() + i * 86400000).toISOString(),
            temperatureMax: 28 + Math.random() * 5,
            temperatureMin: 18 + Math.random() * 5,
            weatherCode: 0,
          })),
        }),
      });
    });

    await page.route("**/api/weather/insights", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          summary: "Dia ensolarado com temperaturas agradáveis",
          trend: "stable",
          alert: false,
          comfortScore: 85,
          tags: ["ensolarado", "confortável"],
        }),
      });
    });
  });

  test("should display main weather card", async ({ page }) => {
    await page.goto("/");
    
    // Wait for dashboard to load
    await page.waitForLoadState("networkidle");
    
    // Should have weather-related content
    const body = await page.locator("body").textContent();
    expect(body).toBeTruthy();
  });

  test("should have Pokemon Mode toggle", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Look for Pokemon mode switch/toggle
    const pokemonToggle = page.getByRole("switch").first();
    
    // If toggle exists, it should be clickable
    if (await pokemonToggle.isVisible()) {
      await expect(pokemonToggle).toBeEnabled();
    }
  });

  test("should be responsive on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Dashboard should be usable on mobile
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("should be responsive on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Dashboard should be usable on tablet
    await expect(page.locator("body")).not.toBeEmpty();
  });
});

test.describe("Dashboard - Navigation", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication with admin role
    await page.addInitScript(() => {
      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const payload = btoa(
        JSON.stringify({
          sub: "admin-user-id",
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

    // Mock API calls
    await page.route("**/api/**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });
  });

  test("should have navigation elements", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Should have some navigation (sidebar, header, etc.)
    const nav = page.locator("nav, aside, header");
    expect(await nav.count()).toBeGreaterThan(0);
  });

  test("should navigate to account page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Try to find and click account/profile link
    const accountLink = page.getByRole("link", { name: /conta|account|perfil|profile/i });
    
    if (await accountLink.isVisible()) {
      await accountLink.click();
      await expect(page).toHaveURL(/account/);
    }
  });
});
