import { test, expect } from '@playwright/test';

test.describe('Authentication & Setup', () => {
  test('Setup Admin Account', async ({ page }) => {
    await page.goto('/');

    // Handle "Authentication Required" landing page (if not redirected)
    const loginLink = page.getByRole('link', { name: 'Login' });
    if (await loginLink.isVisible()) {
        await loginLink.click();
    }

    // Wait for checkFirstUser to resolve and UI to update.
    await page.waitForLoadState('networkidle');

    const setupButton = page.getByRole('button', { name: 'Set Up Admin Account' });

    if (await setupButton.isVisible()) {
      await setupButton.click();
      await page.getByLabel('Username').fill('admin');
      await page.getByLabel('Password', { exact: true }).fill('password123');
      await page.getByLabel('Confirm Password').fill('password123');
      await page.getByRole('button', { name: 'Create Admin Account' }).click();

      await expect(page.getByText('Admin account set up successfully')).toBeVisible();
    } else {
        // If setup button is not visible, it means admin might already exist or we are on login page
        // We can verify we are on login page or dashboard
        const loginHeader = page.getByRole('heading', { name: 'Login' });
        if (await loginHeader.isVisible()) {
             console.log('Admin already set up, on login page.');
        }
    }
  });

  test('Login Flow', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Check if we are already logged in and redirected
    const addNewRecord = page.getByText('Add New Record');
    if (await addNewRecord.isVisible()) {
      console.log('Already logged in');
      return;
    }

    const usernameInput = page.getByLabel('Username');
    await expect(usernameInput).toBeVisible({ timeout: 10000 });
    await usernameInput.fill('admin');
    await page.getByRole('button', { name: 'Continue' }).click();

    const passwordInput = page.getByLabel('Password', { exact: true });

    // Wait for password input or error
    try {
      await expect(passwordInput).toBeVisible({ timeout: 10000 });
    } catch (e) {
      // Check if "Set Password" modal appeared (needsPasswordReset)
      if (await page.getByText('Set Password').isVisible()) {
        console.log('Set Password modal appeared instead');
        // Reset flow if needed or fail
      }
      throw e;
    }

    await passwordInput.fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Verify login success by checking for dashboard element
    await expect(page.getByText('Add New Record')).toBeVisible({ timeout: 15000 });
  });
});
