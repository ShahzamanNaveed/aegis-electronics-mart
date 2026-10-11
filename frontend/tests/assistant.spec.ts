import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("assistant handles an outage, retries, and links database sources", async ({ page }) => {
  let attempts = 0;
  await page.route("**/api/v1/assistant/chat", async route => {
    attempts++;
    if (attempts === 1) {
      await route.fulfill({ status: 503, json: { error: { message: "The local assistant is offline." } } });
      return;
    }
    await route.fulfill({ json: { answer: "Work 14 has 16 GB memory.", model: "smollm2:135m", generated: true,
      request_id: "ui-test", sources: [{ title: "Aegis Studio Work 14", url: "/products/laptops-work-14",
        kind: "product", excerpt: "Memory: 16 GB", price_paisa: 13990000, stock: 13 }] } });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Ask Aegis", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Ask Aegis" });
  await expect(dialog).toBeVisible();
  await expect(page.getByLabel("Your question", { exact: true })).toBeFocused();
  await page.getByLabel("Your question", { exact: true }).fill("Work 14 memory?");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(page.getByRole("alert")).toContainText("offline");
  await page.getByRole("button", { name: "Retry question" }).click();
  await expect(dialog.getByText("Work 14 has 16 GB memory.", { exact: true })).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Aegis Studio Work 14" })).toBeVisible();
  expect((await new AxeBuilder({ page }).include(".assistant-dialog").analyze()).violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await page.getByRole("button", { name: "Ask Aegis", exact: true }).click();
  await page.getByRole("button", { name: "Start a new conversation" }).click();
  await expect(dialog.getByText("Find the details that matter.")).toBeVisible();
});
