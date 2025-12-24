from playwright.sync_api import sync_playwright, expect
import time

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        # Login
        print("Navigating to login page...")
        page.goto("http://localhost:14322/login")
        page.wait_for_load_state("networkidle")

        # Check if setup admin needed (first run)
        if page.get_by_role("button", name="Set Up Admin Account").is_visible():
            print("Setting up admin account...")
            page.get_by_role("button", name="Set Up Admin Account").click()
            page.fill("input[id='username']", "admin")
            page.fill("input[id='password']", "adminpassword")
            page.fill("input[id='confirmPassword']", "adminpassword")
            page.get_by_role("button", name="Create Admin Account").click()
            page.wait_for_timeout(1000)

        # Login process
        print("Logging in...")
        page.fill("input[id='username']", "admin")
        # Step 1: Check user
        page.get_by_role("button", name="Continue").click()
        page.wait_for_timeout(500)
        # Step 2: Password
        page.fill("input[id='password']", "adminpassword")
        page.get_by_role("button", name="Login").click()
        page.wait_for_load_state("networkidle")

        # The default landing page might be "Add Record" instead of Dashboard.
        # Let's check if we are on "Add New Record" or navigate to Dashboard.
        print("Checking landing page...")
        if page.locator("h3.page-title").first.inner_text() == "Add New Record":
             print("Landed on Add Record. Navigating to Dashboard...")
             page.click("button:has-text('Dashboard')")
             page.wait_for_load_state("networkidle")

        # Verify Dashboard load
        expect(page.locator("h3.page-title")).to_have_text("Dashboard")
        print("Dashboard loaded.")

        # Verify Settings Page Layout
        print("Verifying Settings Page Layout...")
        # Direct navigation is more reliable than dropdown if selectors are tricky
        page.goto("http://localhost:14322/settings")
        page.wait_for_load_state("networkidle")

        expect(page.locator("h2.settings-title.page-title")).to_have_text("User Settings")

        # Verify Recurring Expenses Title
        print("Verifying Recurring Expenses Title...")
        page.goto("http://localhost:14322/?tab=recurring")
        page.wait_for_load_state("networkidle")

        expect(page.locator("h3.page-title")).to_have_text("Recurring Expenses")

        # Mobile View Verification for Borders
        print("Verifying Mobile View Borders...")
        # Resize to mobile
        page.set_viewport_size({"width": 375, "height": 812})
        page.reload()
        page.wait_for_load_state("networkidle")

        # Check border color of the card
        page.screenshot(path="verification/mobile_recurring_card.png")
        print("Screenshot taken: verification/mobile_recurring_card.png")

        # Go to Admin Settings (Desktop to nav, then mobile to verify)
        page.set_viewport_size({"width": 1280, "height": 800})
        page.goto("http://localhost:14322/settings?tab=admin")
        page.wait_for_load_state("networkidle")

        page.set_viewport_size({"width": 375, "height": 812})
        page.reload() # Reload to force mobile view logic
        page.wait_for_load_state("networkidle")

        page.screenshot(path="verification/mobile_admin_card.png")
        print("Screenshot taken: verification/mobile_admin_card.png")

        browser.close()

if __name__ == "__main__":
    verify_changes()
