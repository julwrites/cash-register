import { test, expect } from '@playwright/test';

test.describe('Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    // Setup and Login
    await page.goto('/login');
    // Wait for hydration
    await page.waitForLoadState('networkidle');

    // Check if we need to setup admin
    const setupButton = page.getByRole('button', { name: 'Set Up Admin Account' });
    if (await setupButton.isVisible()) {
      await setupButton.click();
      await page.getByLabel('Username').fill('admin');
      await page.getByLabel('Password', { exact: true }).fill('password123');
      const confirmPass = page.getByLabel('Confirm Password');
      if (await confirmPass.isVisible()) {
          await confirmPass.fill('password123');
      }
      await page.getByRole('button', { name: 'Create Account' }).click();
      await page.waitForTimeout(3000); // Wait for processing
    }

    // Login if needed
    // Use precise url check
    if (page.url().includes('/login')) {
         const usernameInput = page.getByLabel('Username');
         if (await usernameInput.isVisible()) {
            await usernameInput.fill('admin');
            await page.waitForTimeout(500); // Ensure state is synced
            await page.getByRole('button', { name: 'Continue' }).click();

            // Check for password field
            const passwordInput = page.getByLabel('Password', { exact: true });
            await expect(passwordInput).toBeVisible({ timeout: 5000 });

            await passwordInput.fill('password123');
            await page.getByRole('button', { name: 'Login' }).click();
         }
    }

    await expect(page).toHaveURL('/', { timeout: 15000 });
  });

  test('Expense Form Layout', async ({ page }) => {
    await page.goto('/?tab=form');
    // Ensure form is loaded
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('.form-grid')).toBeVisible();

    // Mobile View
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000); // wait for layout shift

    const groups = page.locator('.form-grid > div');
    // Wait for groups to be present
    await expect(groups.first()).toBeVisible();

    const box1Mobile = await groups.nth(0).boundingBox();
    const box2Mobile = await groups.nth(1).boundingBox();

    // Expect stacked (same X, different Y)
    // box1 is Date, box2 is Category
    expect(box1Mobile).not.toBeNull();
    expect(box2Mobile).not.toBeNull();

    expect(Math.abs(box1Mobile!.x - box2Mobile!.x)).toBeLessThan(10);
    expect(box2Mobile!.y).toBeGreaterThan(box1Mobile!.y);

    // Desktop View
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(1000); // wait for layout shift

    const box1Desktop = await groups.nth(0).boundingBox();
    const box2Desktop = await groups.nth(1).boundingBox();

    expect(box1Desktop).not.toBeNull();
    expect(box2Desktop).not.toBeNull();

    // Expect side-by-side (different X)
    expect(Math.abs(box1Desktop!.x - box2Desktop!.x)).toBeGreaterThan(50);
  });
});
