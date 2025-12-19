import { test, expect } from '@playwright/test';

test('Core Workflow: Setup -> Login -> Add -> View -> Edit', async ({ page, request }) => {
  // 1. Setup Admin (if needed)
  await test.step('Setup Admin Account', async () => {
    await page.goto('/');

    // Handle "Authentication Required" landing page (if not redirected)
    const loginLink = page.getByRole('link', { name: 'Login' });

    // We want to wait for checkFirstUser to complete ensuring the UI is in the correct state
    let checkFirstUserPromise;

    if (await loginLink.isVisible()) {
        checkFirstUserPromise = page.waitForResponse(resp => resp.url().includes('checkFirstUser'));
        await loginLink.click();
    } else {
        // Maybe already on login or dashboard
        if (page.url().includes('/login')) {
            checkFirstUserPromise = page.waitForResponse(resp => resp.url().includes('checkFirstUser'));
            await page.reload();
        }
    }

    if (checkFirstUserPromise) {
        await checkFirstUserPromise;
        // Small wait for UI update after response
        await page.waitForTimeout(500);
    }

    const setupButton = page.getByRole('button', { name: 'Set Up Admin Account' });

    if (await setupButton.isVisible()) {
      await setupButton.click();
      await page.getByLabel('Username:').fill('admin');
      await page.getByLabel('Password:', { exact: true }).fill('password123');
      await page.getByLabel('Confirm Password:').fill('password123');
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
        await page.goto('/login');
    }

    const usernameInput = page.getByLabel('Username:');
    if (await usernameInput.isVisible()) {
        await usernameInput.fill('admin');
        await page.getByRole('button', { name: 'Continue' }).click();

        const passwordInput = page.getByLabel('Password:', { exact: true });
        await expect(passwordInput).toBeVisible({ timeout: 10000 });

        await passwordInput.fill('password123');
        await page.getByRole('button', { name: 'Login' }).click();
    }

    await expect(page).toHaveURL('/');
    // Check for dashboard element
    await expect(page.getByText('Add New Record')).toBeVisible();
  });

  // 4. Add Expense
  await test.step('Add Expense', async () => {
    await page.goto('/?tab=form');

    await page.getByLabel('Date').fill('2024-01-15');

    // Select Category "Food"
    await page.getByLabel('Category').click();
    await page.getByText('Food', { exact: true }).click();

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
    await page.getByRole('button', { name: 'Recent' }).click();

    // Check for row
    await expect(page.getByRole('cell', { name: 'Team Lunch' })).toBeVisible();
    // Verify amount
    await expect(page.getByRole('cell').filter({ hasText: '45.50' })).toBeVisible();
  });

  // 6. Edit Expense
  await test.step('Edit Expense', async () => {
    // Find row
    const row = page.getByRole('row').filter({ hasText: 'Team Lunch' });

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
    await expect(page.getByRole('cell').filter({ hasText: '50.00' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Food' })).toBeVisible();
  });
});
