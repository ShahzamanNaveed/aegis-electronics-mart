import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("search opens a complete article and missing searches recover", async ({
  page,
}) => {
  await page.goto("/help-center");
  await expect(
    page.getByRole("heading", { name: "Cooling", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search help articles" })
    .fill("washing first");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page
    .getByRole("heading", { name: "Before your washing machine’s first wash" })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Before your washing machine’s first wash",
  );
  await expect(page.locator(".article-section")).toHaveCount(3);
  await page.goto("/help?query=zzznomatch");
  await expect(
    page.getByRole("heading", { name: "No guides found." }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Browse all guides", exact: true })
    .click();
  await expect(page.locator(".article-card")).toHaveCount(6);
});

test("filters, pagination, categories and history work", async ({ page }) => {
  await page.goto("/help");
  await expect(page.locator(".article-card")).toHaveCount(6);
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByText("Page 2 of 2")).toBeVisible();
  await page.getByLabel("Appliance category").selectOption("laundry");
  await page.getByLabel("What do you need?").selectOption("setup");
  await expect(page.locator(".article-card")).toHaveCount(1);
  await page.reload();
  await expect(page.getByLabel("Appliance category")).toHaveValue("laundry");
  await page.goto("/help/category/cooling");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Cooling help",
  );
  await expect(page.locator(".article-card")).toHaveCount(2);
  await page.goto("/help/articles/does-not-exist");
  await expect(
    page.getByRole("heading", { name: "Let’s find your way back." }),
  ).toBeVisible();
});

test("responsive navigation and public pages are accessible", async ({
  page,
}, testInfo) => {
  for (const path of [
    "/help-center",
    "/help",
    "/help/articles/washing-machine-first-wash",
    "/about",
    "/privacy",
  ]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    if (path === "/help-center")
      await expect(
        page.getByRole("heading", { name: "Cooling", exact: true }),
      ).toBeVisible();
    if (path === "/help")
      await expect(page.locator(".article-card")).toHaveCount(6);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations).toEqual([]);
    if (path === "/help-center" && process.env.PORTAL_CAPTURE === "1") {
      await page.screenshot({
        path: `../docs/home-${testInfo.project.name}.png`,
        fullPage: true,
      });
    }
  }
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "Help library" })
      .click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "The help library.",
    );
  }
});

test("API outage offers a working retry", async ({ page }) => {
  await page.route("**/api/v1/help/articles?**", (route) =>
    route.fulfill({ status: 503, body: "{}" }),
  );
  await page.goto("/help");
  await expect(
    page.getByRole("heading", { name: "The library is taking a moment." }),
  ).toBeVisible();
  await page.unroute("**/api/v1/help/articles?**");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.locator(".article-card")).toHaveCount(6);
});
