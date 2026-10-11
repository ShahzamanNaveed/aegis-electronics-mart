import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("catalog search, filters, sort and detail", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".department-card")).toHaveCount(12);
  await page
    .getByRole("textbox", { name: "Search products", exact: true })
    .fill("Work 14");
  await page
    .getByRole("button", { name: "Search products", exact: true })
    .click();
  await page.getByRole("link", { name: "Work 14", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Work 14");
  await expect(page.locator(".spec-table")).toContainText("16 GB");
  await page
    .getByText("Can I use it for games or video editing?", { exact: true })
    .click();
  await expect(page.locator("details[open]")).toContainText(
    "dedicated graphics",
  );
  await page.goto("/shop");
  await expect(page.locator(".product-card")).toHaveCount(12);
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText("Page 2 of 5")).toBeVisible();
  await page.getByLabel("Department", { exact: true }).selectOption("laptops");
  await page.getByLabel("Sort by").selectOption("price-desc");
  await expect(page.locator(".product-card")).toHaveCount(5);
  await expect(page.locator(".product-card").first()).toContainText(
    "Performance 16",
  );
  await page.getByLabel("To", { exact: true }).fill("100000");
  await page.getByRole("button", { name: "Apply price range" }).click();
  await expect(page.locator(".product-card")).toHaveCount(2);
  await page.goto("/shop?query=zzznomatch");
  await expect(
    page.getByRole("heading", { name: "No products match just yet." }),
  ).toBeVisible();
  await page.goto("/products/missing-product");
  await expect(
    page.getByRole("heading", { name: "Let’s find your way back." }),
  ).toBeVisible();
});

test("comparison, basket prices and persistence", async ({ page }) => {
  await page.goto("/products/laptops-work-14");
  await page
    .getByRole("button", { name: "Compare Aegis Studio Work 14", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Add Aegis Studio Work 14 to basket",
      exact: true,
    })
    .click();
  await page.goto("/products/laptops-note-14");
  await page
    .getByRole("button", { name: "Compare Aegis Studio Note 14", exact: true })
    .click();
  await page.goto("/compare");
  await expect(page.getByRole("table")).toContainText("16 GB");
  await expect(page.getByRole("table")).toContainText("8 GB");
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.goto("/basket");
  await expect(page.locator(".basket-line")).toHaveCount(1);
  await page
    .getByLabel("Quantity for Aegis Studio Work 14", { exact: true })
    .selectOption("2");
  await expect(page.locator(".basket-summary")).toContainText("279,800");
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.reload();
  await expect(
    page.getByLabel("Quantity for Aegis Studio Work 14", { exact: true }),
  ).toHaveValue("2");
  await page
    .getByRole("button", { name: "Remove Aegis Studio Work 14", exact: true })
    .click();
  await expect(
    page.getByText("Your basket is empty.", { exact: true }),
  ).toBeVisible();
  await page.goto("/products/refrigerators-compact-180");
  await expect(
    page.getByRole("button", {
      name: "Add Aegis North Compact 180 to basket",
      exact: true,
    }),
  ).toBeDisabled();
});

test("catalog pages meet automated accessibility and layout checks", async ({
  page,
}, info) => {
  for (const path of [
    "/",
    "/shop",
    "/products/laptops-work-14",
    "/basket",
    "/compare",
  ]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    if (path === "/")
      await expect(page.locator(".department-card")).toHaveCount(12);
    if (path === "/shop")
      await expect(page.locator(".product-card")).toHaveCount(12);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    if (path === "/" && process.env.PORTAL_CAPTURE === "1") {
      await page.screenshot({
        path: `../docs/mart-${info.project.name}.png`,
        fullPage: true,
      });
      if (info.project.name === "desktop")
        await page.screenshot({ path: "../docs/mart-preview.png" });
    }
  }
});

test("catalog and basket failures are recoverable", async ({ page }) => {
  await page.route("**/api/v1/catalog/products?**", (r) =>
    r.fulfill({ status: 503, body: "{}" }),
  );
  await page.goto("/shop");
  await expect(
    page.getByRole("heading", { name: "We couldn’t load the catalog." }),
  ).toBeVisible();
  await page.unroute("**/api/v1/catalog/products?**");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.locator(".product-card")).toHaveCount(12);
  await page.goto("/products/laptops-work-14");
  await page
    .getByRole("button", {
      name: "Add Aegis Studio Work 14 to basket",
      exact: true,
    })
    .click();
  await page.route("**/api/v1/catalog/basket/quote", (r) =>
    r.fulfill({ status: 503, body: "{}" }),
  );
  await page.goto("/basket");
  await expect(
    page.getByRole("heading", { name: "Your basket needs a refresh." }),
  ).toBeVisible();
  await page.unroute("**/api/v1/catalog/basket/quote");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.locator(".basket-line")).toHaveCount(1);
});
