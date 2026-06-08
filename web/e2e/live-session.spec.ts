import { test, expect } from "@playwright/test";

const teacherEmail = process.env.E2E_TEACHER_EMAIL;
const teacherPassword = process.env.E2E_TEACHER_PASSWORD;

test.describe("live session flow", () => {
  test.skip(!teacherEmail || !teacherPassword, "Set E2E_TEACHER_EMAIL and E2E_TEACHER_PASSWORD");

  test("login → circles", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(teacherEmail!);
    await page.getByLabel("Password").fill(teacherPassword!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/circles/);
  });
});
