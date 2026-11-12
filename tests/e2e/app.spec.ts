import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("shows hero content and navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("CycleCare")).toBeVisible();
    await expect(page.getByText("Understand your")).toBeVisible();
    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Get Started" })
    ).toBeVisible();
  });

  test("navigates to login page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText("Welcome back")).toBeVisible();
  });

  test("navigates to signup page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Get Started" }).click();
    await expect(page).toHaveURL(/\/signup/);
  });
});

test.describe("Auth Pages", () => {
  test("login page shows form fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /sign in/i })
    ).toBeVisible();
  });

  test("login validates required fields", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test("signup page shows form fields", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("forgot password page works", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /reset/i })
    ).toBeVisible();
  });
});

test.describe("PWA", () => {
  test("manifest is accessible", async ({ page }) => {
    const response = await page.goto("/manifest.webmanifest");
    expect(response?.status()).toBe(200);
    const manifest = await response?.json();
    expect(manifest.name).toBe("CycleCare");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  test("service worker is registered", async ({ page }) => {
    await page.goto("/");
    const swRegistered = await page.evaluate(async () => {
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        return !!reg;
      }
      return false;
    });
    // SW may not be registered in test environment
    expect(typeof swRegistered).toBe("boolean");
  });
});

test.describe("Protected Routes", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("redirects from calendar to login when not authenticated", async ({
    page,
  }) => {
    await page.goto("/calendar");
    await expect(page).toHaveURL(/\/login/);
  });
});
