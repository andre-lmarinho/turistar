import { expect, test } from "@playwright/test";

import { authenticateE2EUser } from "./helpers/auth";

test.describe("Budget Management", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateE2EUser(page);
    await page.goto("/p/plan-e2e-001");

    await page.getByRole("button", { name: /budget/i }).click();
  });

  test("displays budget summary section", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /summary/i })).toBeVisible();

    await expect(page.getByText(/total budget/i)).toBeVisible();
    await expect(page.getByText(/total spent/i).first()).toBeVisible();
    await expect(page.getByText(/difference/i).first()).toBeVisible();
  });

  test("sets total budget for the plan", async ({ page }) => {
    const budgetSection = page.getByRole("region", { name: /summary/i });

    const budgetInput = budgetSection.getByRole("textbox", { name: /total budget/i });
    await expect(budgetInput).toBeVisible();

    await budgetInput.fill("5000");
    await budgetInput.press("Tab");

    await expect(budgetInput).toHaveValue("5000");
  });

  test("displays expenses table", async ({ page }) => {
    const expensesSection = page.getByRole("region", { name: /expenses/i });
    await expect(expensesSection).toBeVisible();

    await expect(expensesSection.getByRole("table")).toBeVisible();
    await expect(expensesSection.getByRole("columnheader", { name: /description/i })).toBeVisible();
    await expect(expensesSection.getByRole("columnheader", { name: /category/i })).toBeVisible();
    await expect(expensesSection.getByRole("columnheader", { name: /amount/i })).toBeVisible();
    await expect(expensesSection.getByRole("columnheader", { name: /actions/i })).toBeVisible();
  });

  test("adds a new expense", async ({ page }) => {
    const expensesSection = page.getByRole("region", { name: /expenses/i });

    const descriptionInput = expensesSection.getByRole("textbox", { name: /description/i }).first();
    await expect(descriptionInput).toBeVisible();

    await descriptionInput.fill("Hotel");

    const categorySelect = expensesSection.getByRole("combobox", { name: /category/i }).first();
    await expect(categorySelect).toBeVisible();
    await categorySelect.selectOption("lodging");

    const amountInput = expensesSection.getByRole("textbox", { name: /amount/i }).first();
    await expect(amountInput).toBeVisible();
    await amountInput.fill("200");

    const addButton = expensesSection.getByRole("button", { name: /add expense/i });
    await addButton.click();

    await expect(expensesSection.getByRole("row", { name: /hotel/i })).toBeVisible();
  });

  test("has add expense button enabled when amount is filled", async ({ page }) => {
    const expensesSection = page.getByRole("region", { name: /expenses/i });

    const addButton = expensesSection.getByRole("button", { name: /add expense/i });
    const amountInput = expensesSection.getByRole("textbox", { name: /amount/i }).first();

    await amountInput.fill("100");
    await expect(addButton).toBeEnabled();
  });
});
