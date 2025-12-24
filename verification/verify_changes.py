from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1280, 'height': 720})
    page = context.new_page()

    try:
        # Login
        print("Logging in...")
        page.goto("http://localhost:14322/login")
        page.wait_for_load_state('networkidle')

        try:
            page.wait_for_selector("input[name='username']", timeout=10000)
        except:
            print("Username input not found, taking screenshot")
            page.screenshot(path="verification/login_fail_1.png")
            raise

        page.fill("input[name='username']", "admin")
        page.click("button[type='submit']")

        # Wait for password field or modal
        try:
            page.wait_for_selector("input[name='password']", timeout=10000)
        except:
            print("Password input not found, checking for modal or error")
            page.screenshot(path="verification/login_fail_2.png")
            # Check for modal
            if page.locator("text=Set Up Admin Account").is_visible():
                print("Setup Admin Account modal visible")
            if page.locator("text=Set Password").is_visible():
                 print("Set Password modal visible")
            raise

        page.fill("input[name='password']", "password123")
        page.click("button[type='submit']")

        # Wait for navigation
        page.wait_for_url("http://localhost:14322/", timeout=30000)
        print("Logged in.")

        # 1. Verify Category Settings Mobile View
        print("Verifying Category Settings Mobile View...")
        page.goto("http://localhost:14322/settings?tab=manage-categories")
        page.wait_for_load_state('networkidle')

        # Ensure we are on the correct tab
        try:
            if not page.locator("h3:has-text('Add Category')").is_visible():
                print("Not on Manage Categories tab, clicking tab...")
                page.click("button:has-text('Manage Categories')")
                page.wait_for_selector("h3:has-text('Add Category')")
        except:
            print("Could not switch to Manage Categories tab. Is user admin?")
            page.screenshot(path="verification/tab_switch_fail.png")
            raise

        # Add a category
        page.fill("input[placeholder='Enter new category name']", "TestCat1")
        page.click("button:has-text('Add Category')")
        time.sleep(2) # Wait for network

        # Switch to mobile
        page.set_viewport_size({'width': 375, 'height': 667})
        # Check for mobile card
        expect(page.locator(".mobile-card").first).to_be_visible()
        expect(page.locator(".mobile-card-title").first).to_contain_text("TestCat1")
        page.screenshot(path="verification/mobile_categories.png")
        print("Mobile Categories verified.")

        # Restore Desktop
        page.set_viewport_size({'width': 1280, 'height': 720})

        # 2. Verify Expense Form Reactivity
        print("Verifying Expense Form Reactivity...")
        # Add expenses
        page.goto("http://localhost:14322/?tab=form")

        # Exp 1
        page.fill("input[id='date']", "2023-01-01")
        # Category
        # Need to open select menu
        page.get_by_label("Category").click()
        page.click("span:has-text('TestCat1')")

        # Description
        page.get_by_label("Description").click()
        page.keyboard.type("Expense One")
        page.keyboard.press("Enter")

        page.fill("input[id='debit']", "100")
        page.click("button:has-text('Submit')")
        time.sleep(2)

        # Exp 2
        page.fill("input[id='date']", "2023-01-02")
        page.get_by_label("Category").click()
        page.click("span:has-text('TestCat1')")

        page.get_by_label("Description").click()
        page.keyboard.type("Expense Two")
        page.keyboard.press("Enter")

        page.fill("input[id='debit']", "200")
        page.click("button:has-text('Submit')")
        time.sleep(2)

        # Dashboard Edit
        page.goto("http://localhost:14322/?tab=dashboard")

        # Open Exp 1
        # .transaction-item contains text
        print("Opening Expense One...")
        page.click("text=Expense One")
        expect(page.locator("h3:has-text('Edit Expense')")).to_be_visible()
        # Check value
        val1 = page.input_value("input[id='debit']")
        if val1 != "100":
            print(f"FAILED: Expected 100, got {val1}")
        else:
            print("Expense One value correct.")

        page.click("button:has-text('Cancel')")
        time.sleep(1) # Wait for modal to close

        # Open Exp 2
        print("Opening Expense Two...")
        page.click("text=Expense Two")
        expect(page.locator("h3:has-text('Edit Expense')")).to_be_visible()
        val2 = page.input_value("input[id='debit']")
        if val2 != "200":
            print(f"FAILED: Reactivity Issue! Expected 200, got {val2}")
        else:
            print("Expense Two value correct (Reactivity works).")

        page.screenshot(path="verification/dashboard_edit.png")

        # 3. Verify Admin Settings Mobile View
        print("Verifying Admin Settings Mobile View...")
        page.goto("http://localhost:14322/settings?tab=admin")
        page.wait_for_load_state('networkidle')

        # Ensure we are on the correct tab
        try:
            if not page.locator("h2:has-text('Admin Dashboard')").is_visible():
                print("Not on Admin tab, clicking tab...")
                page.click("button:has-text('Admin')")
                page.wait_for_selector("h2:has-text('Admin Dashboard')")
        except:
             print("Could not switch to Admin tab.")
             page.screenshot(path="verification/admin_tab_fail.png")
             raise

        # Switch to mobile
        page.set_viewport_size({'width': 375, 'height': 667})
        expect(page.locator(".mobile-card").first).to_be_visible()
        expect(page.locator(".mobile-card-title").first).to_contain_text("admin")
        page.screenshot(path="verification/mobile_admin.png")
        print("Mobile Admin verified.")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error_state.png")
    finally:
        browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
