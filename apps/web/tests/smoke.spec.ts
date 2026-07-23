import { test, expect } from "@playwright/test";

test("landing page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "AgentLedger" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hard stop budgets" })).toBeVisible();
});

test("health endpoint", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.status).toBeTruthy();
});
