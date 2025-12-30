import { test, expect } from '@playwright/test';

test.describe('Expense Management', () => {
    // Shared login step
    test.beforeEach(async ({ page, request }) => {
        // Ensure Admin Exists (Idempotent)
        // We can't easily check DB from here without custom tool, but we can assume it exists or handle it in global setup
        // For now, let's try to login. If it fails due to no user, we might be in trouble unless we sequence tests.
        // Better: Check if we need setup first.

        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        // Check for Setup
        const setupButton = page.getByRole('button', { name: 'Set Up Admin Account' });
        if (await setupButton.isVisible()) {
             await setupButton.click();
             await page.getByLabel('Username').fill('admin');
             await page.getByLabel('Password', { exact: true }).fill('password123');
             await page.getByLabel('Confirm Password').fill('password123');
             await page.getByRole('button', { name: 'Create Admin Account' }).click();
             await expect(page.getByText('Admin account set up successfully')).toBeVisible();
             // Setup redirects to login usually
        }

        // Login
        const usernameInput = page.getByLabel('Username');
        if (await usernameInput.isVisible()) {
            await usernameInput.fill('admin');
            await page.getByRole('button', { name: 'Continue' }).click();
            await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
            await page.getByLabel('Password', { exact: true }).fill('password123');
            await page.getByRole('button', { name: 'Login' }).click();
            await expect(page).toHaveURL('/');
        }
    });

    test('Add Expense', async ({ page, request }) => {
        // Seed Category
        await request.post('/api/categories', {
          data: { name: 'Food' }
        });

        await page.goto('/?tab=form');

        await page.getByLabel('Date').fill('2024-01-15');

        // Select Category "Food"
        await page.getByLabel('Category').click();
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

    test('View and Edit Expense', async ({ page, request }) => {
        // Seed Data
         await request.post('/api/categories', { data: { name: 'Food' } });
         // We might need to seed an expense or rely on previous test?
         // Tests should be isolated. Let's add one via API or UI.
         // Since we don't have a direct API for adding expenses easily exposed in this context without auth headers...
         // Actually request context has cookies if we logged in via UI? No, Playwright request context is separate unless storageState is used.
         // Let's use UI to add for now or assume sequential run (which is bad).
         // Better: Use UI to add quick.

        // Add Expense for test
        await page.goto('/?tab=form');
        await page.getByLabel('Date').fill('2024-01-15');
        await page.getByLabel('Category').click();
        await page.locator('[role="option"]').filter({ hasText: 'Food' }).first().click();
        await page.getByLabel('Description').fill('Test Expense');
        await page.getByLabel('Debit').fill('10.00');
        await page.getByRole('button', { name: 'Submit' }).click();
        await expect(page.getByText('Expense added successfully')).toBeVisible();

        // View
        await page.goto('/?tab=list');
        await page.getByRole('button', { name: 'Recent' }).click();

        // Find row
        const row = page.getByRole('row').filter({ hasText: 'Test Expense' });
        await expect(row).toBeVisible();
        await expect(row.getByText('10.00')).toBeVisible();

        // Edit
        await row.getByRole('button').last().click();
        await page.getByRole('menuitem', { name: 'Edit' }).click();

        await expect(page.getByText('Edit Expense')).toBeVisible();
        await page.getByLabel('Debit').fill('20.00');
        await page.getByRole('button', { name: 'Update' }).click();

        await expect(page.getByText('Expense updated successfully')).toBeVisible();
        await expect(page.getByRole('cell').filter({ hasText: '20.00' })).toBeVisible();
    });
});
