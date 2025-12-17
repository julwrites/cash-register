from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        print("Navigating to login...")
        page.goto("http://localhost:14322/login")
        page.wait_for_load_state("networkidle")

        # Login
        print("Logging in...")
        try:
            if "/login" in page.url:
                page.fill("input#username", "admin")
                page.get_by_role("button", name="Continue").click()
                expect(page.locator("input#password")).to_be_visible(timeout=5000)
                page.locator("input#password").fill("password123")
                page.get_by_role("button", name="Login").click()
                page.wait_for_url("http://localhost:14322/", timeout=15000)
        except Exception as e:
            print("Login failed:", e)
            if page.url != "http://localhost:14322/":
                browser.close()
                return

        print("Logged in successfully.")

        # Verify Header Elements
        time.sleep(2) # Wait for animations/rendering

        page.screenshot(path="/home/jules/verification/new_layout_form.png")
        print("Screenshot: new_layout_form.png")

        print("Clicking Dashboard tab...")
        # Note: get_by_text("Dashboard") might find multiple if not careful, but header should be unique now
        page.get_by_role("tab", name="Dashboard").click() # UTabs renders as role=tab?
        # If UTabs uses buttons or divs:
        # page.get_by_text("Dashboard").click()
        # Let's try text first, assuming old one is gone.

        # Wait for URL change
        try:
            page.wait_for_url("http://localhost:14322/?tab=dashboard", timeout=5000)
        except:
            # Fallback for click logic
            page.get_by_text("Dashboard").click()
            page.wait_for_url("http://localhost:14322/?tab=dashboard")

        page.screenshot(path="/home/jules/verification/new_layout_dashboard.png")
        print("Screenshot: new_layout_dashboard.png")

        print("Clicking Expense List tab...")
        page.get_by_text("Expense List").click()
        page.wait_for_url("http://localhost:14322/?tab=list")
        page.screenshot(path="/home/jules/verification/new_layout_list.png")
        print("Screenshot: new_layout_list.png")

        browser.close()

if __name__ == "__main__":
    run()
