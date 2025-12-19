import { test, expect } from '@playwright/test';

test('Core Workflow: Setup -> Login -> Add -> View -> Edit', async ({ page, request }) => {
  page.on('console', msg => console.log(`Browser console: ${msg.text()}`));

  // 1. Setup Admin (if needed)
  await test.step('Setup Admin Account', async () => {
    console.log('Starting Setup Admin Account step');
    await page.goto('/');

    // Handle "Authentication Required" landing page (if not redirected)
    const loginLink = page.getByRole('link', { name: 'Login' });

    // We want to wait for checkFirstUser to complete ensuring the UI is in the correct state
    // We set up the promise before navigating to /login
    let checkFirstUserPromise;

    if (await loginLink.isVisible()) {
        console.log('Clicking Login link on landing page');
        checkFirstUserPromise = page.waitForResponse(resp => resp.url().includes('checkFirstUser'));
        await loginLink.click();
    } else {
        // Maybe already on login or dashboard
        if (page.url().includes('/login')) {
            console.log('Already on /login, reloading to trigger checkFirstUser');
            checkFirstUserPromise = page.waitForResponse(resp => resp.url().includes('checkFirstUser'));
            await page.reload();
        }
    }

    if (checkFirstUserPromise) {
        console.log('Waiting for checkFirstUser response');
        await checkFirstUserPromise;
        // Small wait for UI update after response
        await page.waitForTimeout(500);
    }

    // Now we should be on /login (or redirected if auth?)
    // If setup is needed, "Set Up Admin Account" button should be visible.

    const setupButton = page.getByRole('button', { name: 'Set Up Admin Account' });

    if (await setupButton.isVisible()) {
      console.log('Setup button visible, creating admin account');
      await setupButton.click();
      await page.getByLabel('Username:').fill('admin');
      await page.getByLabel('Password:', { exact: true }).fill('password123');
      await page.getByLabel('Confirm Password:').fill('password123');
      await page.getByRole('button', { name: 'Create Admin Account' }).click();

      await expect(page.getByText('Admin account set up successfully')).toBeVisible();
      console.log('Admin account setup complete');
    } else {
        console.log('Setup button not visible, assuming admin already exists');
    }
  });

  // 2. Seed Categories
  await test.step('Seed Categories', async () => {
      console.log('Seeding categories');
      const response = await request.post('/api/categories', {
          data: { name: 'Food' }
      });
      console.log(`Seed categories response: ${response.status()}`);
      expect(response.ok()).toBeTruthy();
  });

  // 3. Login
  await test.step('Login', async () => {
    console.log('Starting Login step');
    if (!page.url().includes('/login')) {
        await page.goto('/login');
    }

    // If we are on login page, we might need to wait for checkFirstUser again?
    // Not really, we just handled setup.
    // If setup was done, isFirstUser is false.

    const usernameInput = page.getByLabel('Username:');
    if (await usernameInput.isVisible()) {
        console.log('Filling username');
        await usernameInput.fill('admin');
        await page.getByRole('button', { name: 'Continue' }).click();

        console.log('Waiting for password input');
        const passwordInput = page.getByLabel('Password:', { exact: true });

        try {
            await expect(passwordInput).toBeVisible({ timeout: 10000 });
        } catch (e) {
            console.log('Password input not visible. Page text:');
            console.log(await page.textContent('body'));
            throw e;
        }

        await passwordInput.fill('password123');
        await page.getByRole('button', { name: 'Login' }).click();
    }

    await expect(page).toHaveURL('/');
    // Check for dashboard element
    await expect(page.getByText('Add New Record')).toBeVisible();
    console.log('Login complete');
  });

  // 4. Add Expense
  await test.step('Add Expense', async () => {
    console.log('Starting Add Expense step');
    await page.goto('/?tab=form');

    await page.getByLabel('Date').fill('2024-01-15');

    // Select Category "Food"
    // Use click and basic locator if role option fails
    await page.getByLabel('Category').click();
    // Sometimes the options are not role=option.
    // Nuxt UI USelectMenu uses Headless UI.
    // Let's look for text "Food"
    await page.getByText('Food', { exact: true }).click();

    // Description
    await page.getByLabel('Description').click();
    await page.keyboard.type('Team Lunch');
    await page.keyboard.press('Enter');

    // Amount (Debit)
    await page.getByLabel('Debit').fill('45.50');

    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText('Expense added successfully')).toBeVisible();
    console.log('Add Expense complete');
  });

  // 5. View Expense
  await test.step('View Expense', async () => {
    console.log('Starting View Expense step');
    await page.goto('/?tab=list');
    await page.getByRole('button', { name: 'Recent' }).click();

    // Check for row
    await expect(page.getByRole('cell', { name: 'Team Lunch' })).toBeVisible();
    // Verify amount
    await expect(page.getByRole('cell').filter({ hasText: '45.50' })).toBeVisible();
    console.log('View Expense complete');
  });

  // 6. Edit Expense
  await test.step('Edit Expense', async () => {
    console.log('Starting Edit Expense step');
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

    // Save (Button text is "Update")
    await page.getByRole('button', { name: 'Update' }).click();

    // Verify toast
    await expect(page.getByText('Expense updated successfully')).toBeVisible();

    // Verify table update
    await expect(page.getByRole('cell').filter({ hasText: '50.00' })).toBeVisible();
    console.log('Edit Expense complete');
  });
});
