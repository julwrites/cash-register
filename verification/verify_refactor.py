from playwright.sync_api import sync_playwright, expect
import time
import os

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        try:
            # Navigate to home
            print("Navigating to home...")
            page.goto("http://localhost:14322")

            # Wait for potential redirect
            page.wait_for_load_state('networkidle')

            # Check if we are on login page
            if "/login" in page.url:
                print("On login page")

                # Check for "Set Up Admin Account" button (First user)
                time.sleep(1)

                setup_btn = page.get_by_role("button", name="Set Up Admin Account")
                if setup_btn.is_visible():
                    print("Setting up admin...")
                    setup_btn.click()
                    page.fill("input[name='username']", "admin")
                    page.fill("input[name='password']", "admin123")
                    page.fill("input[name='confirmPassword']", "admin123")
                    page.click("button:has-text('Create Admin Account')")

                    # Now we need to login
                    print("Logging in after setup...")
                    time.sleep(1) # Wait for modal to close and form to appear

                # Login flow (shared)
                print("Performing login...")
                page.fill("input[name='username']", "admin")
                page.click("button:has-text('Continue')") # First step

                # Wait for password field
                page.wait_for_selector("input[name='password']", timeout=5000)
                page.fill("input[name='password']", "admin123")
                page.click("button:has-text('Login')")

                page.wait_for_url("http://localhost:14322/", timeout=10000)

            print("Logged in. Verifying Dashboard...")
            time.sleep(3) # Allow data fetch and auth sync

            page.screenshot(path="/home/jules/verification/dashboard.png", full_page=True)
            print("Dashboard screenshot taken.")

            print("Navigating to Expense List...")
            page.goto("http://localhost:14322/?tab=list")
            page.wait_for_load_state('networkidle')
            time.sleep(2)
            page.screenshot(path="/home/jules/verification/expense_list.png", full_page=True)
            print("Expense List screenshot taken.")

            print("Navigating to Settings...")
            page.goto("http://localhost:14322/settings")
            page.wait_for_load_state('networkidle')
            time.sleep(1)
            page.screenshot(path="/home/jules/verification/settings.png", full_page=True)
            print("Settings screenshot taken.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()
