import { test, expect } from '@playwright/test';

test('Core Workflow: Setup -> Login -> Add -> View -> Edit', async ({ page, request }) => {
  // 1. Setup Admin (if needed)
  await test.step('Setup Admin Account', async () => {
    await page.goto('/');

    // Handle "Authentication Required" landing page (if not redirected)
    const loginLink = page.getByRole('link', { name: 'Login' });

    if (await loginLink.isVisible()) {
        await loginLink.click();
    }

    // Wait for checkFirstUser to resolve and UI to update.
    await page.waitForTimeout(3000);

    const setupButton = page.getByRole('button', { name: 'Set Up Admin Account' });

    if (await setupButton.isVisible()) {
      await setupButton.click();
      await page.getByLabel('Username').fill('admin');
      await page.getByLabel('Password', { exact: true }).fill('password123');
      await page.getByLabel('Confirm Password').fill('password123');
      await page.getByRole('button', { name: 'Create Admin Account' }).click();

      await expect(page.getByText('Admin account set up successfully')).toBeVisible();
    }
  });

  // 2. Seed Categories
  await test.step('Seed Categories', async () => {
      const response = await request.post('/api/categories', {
          data: { name: 'Food' }
      });
      expect(response.ok()).toBeTruthy();
  });

  // 3. Login
  await test.step('Login', async () => {
    if (!page.url().includes('/login')) {
        if (page.url().endsWith('/')) return;

        await page.goto('/login');
    }

    const usernameInput = page.getByLabel('Username');
    if (await usernameInput.isVisible()) {
        await usernameInput.fill('admin');
        await page.getByRole('button', { name: 'Continue' }).click();

        const passwordInput = page.getByLabel('Password', { exact: true });

        // Wait for password input or error
        try {
            await expect(passwordInput).toBeVisible({ timeout: 10000 });
        } catch (e) {
            console.log('Password input not visible');
            // Check if "Set Password" modal appeared (needsPasswordReset)
            if (await page.getByText('Set Password').isVisible()) {
                console.log('Set Password modal appeared instead');
            }
            throw e;
        }

        await passwordInput.fill('password123');
        await page.getByRole('button', { name: 'Login' }).click();
    }

    try {
        await expect(page).toHaveURL('/', { timeout: 15000 });
    } catch (e) {
        console.log('Login failed to redirect. Current URL:', page.url());
        if (await page.getByText('Login Failed').isVisible()) {
             console.log('Login failed toast detected');
        }
        throw e;
    }

    // Ensure hydration and auth state propagation
    await page.waitForLoadState('networkidle');

    // Debugging: If "Add New Record" isn't visible, check if we are still showing "Authentication Required"
    if (await page.getByText('Authentication Required').isVisible()) {
        console.log('Still showing Authentication Required after redirect. Reloading...');
        await page.reload();
        await page.waitForLoadState('networkidle');
    }

    // Check for dashboard element (Add New Record header)
    await expect(page.getByRole('heading', { name: 'Add New Record' })).toBeVisible({ timeout: 10000 });
  });

  // 4. Add Expense
  await test.step('Add Expense', async () => {
    await page.goto('/?tab=form');

    await page.getByLabel('Date').fill('2024-01-15');

    // Select Category "Food"
    await page.getByLabel('Category').click();
    // Scope to role="option" to avoid strict mode violation
    await page.locator('[role="option"]').filter({ hasText: 'Food' }).first().click();

    // Description
    await page.getByLabel('Description').click();
    await page.keyboard.type('Team Lunch');
    await page.keyboard.press('Enter');

    // Amount (Debit)
    await page.getByLabel('Debit').fill('45.50');

    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText('Expense added successfully')).toBeVisible();
  });

  // 5. View Expense
  await test.step('View Expense', async () => {
    await page.goto('/?tab=list');

    // Switch to All Time view to see 2024 record
    await page.getByRole('button', { name: 'All', exact: true }).click();

    // Select "All Time" period
    // The select menu trigger usually has the current value "This Month"
    // Use last() to target the inner button if Nuxt UI wraps it in a div[role=button]
    await page.getByRole('button', { name: 'This Month' }).last().click();
    await page.getByRole('option', { name: 'All Time' }).click();

    // Check for row
    await expect(page.getByRole('cell', { name: 'Team Lunch' }).first()).toBeVisible();
    // Verify amount
    await expect(page.getByRole('cell').filter({ hasText: '45.50' }).first()).toBeVisible();
  });

  // 6. Edit Expense
  await test.step('Edit Expense', async () => {
    // Find row
    const row = page.getByRole('row').filter({ hasText: 'Team Lunch' }).first();

    // Click actions (last button in row)
    await row.getByRole('button').last().click();

    // Click Edit
    await page.getByRole('menuitem', { name: 'Edit' }).click();

    // Modal
    await expect(page.getByText('Edit Expense')).toBeVisible();

    // Change amount
    await page.getByLabel('Debit').fill('50.00');

    // Update
    await page.getByRole('button', { name: 'Update' }).click();

    // Verify toast
    await expect(page.getByText('Expense updated successfully')).toBeVisible();

    // Verify table update
    await expect(page.getByRole('cell').filter({ hasText: '50.00' }).first()).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Food' }).first()).toBeVisible();
  });
});
