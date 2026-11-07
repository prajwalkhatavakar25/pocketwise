import subprocess
import time
import sys
import os
import urllib.request
from playwright.sync_api import sync_playwright

def wait_for_server(url, timeout=15):
    start = time.time()
    while time.time() - start < timeout:
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                if response.status == 200:
                    return True
        except Exception as e:
            time.sleep(0.5)
    return False

def run_tests():
    print("[E2E] Starting Vite preview server on 127.0.0.1:4173...", flush=True)
    server_process = subprocess.Popen(
        ["npx", "vite", "preview", "--port", "4173", "--host", "127.0.0.1"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        shell=True
    )

    if not wait_for_server("http://127.0.0.1:4173/"):
        print("[E2E] Failed to connect to preview server within timeout", flush=True)
        # print stderr
        out, err = server_process.communicate(timeout=2)
        print("Stdout:", out)
        print("Stderr:", err)
        server_process.terminate()
        sys.exit(1)

    print("[E2E] Preview server ready at http://127.0.0.1:4173/", flush=True)
    console_errors = []

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)

            # --- 1. Desktop Test (1440x900) ---
            print("\n--- Testing Desktop Viewport (1440x900) ---", flush=True)
            context = browser.new_context(viewport={"width": 1440, "height": 900})
            page = context.new_page()

            page.on("console", lambda msg: console_errors.append(f"Console {msg.type}: {msg.text}") if msg.type == "error" else None)
            page.on("pageerror", lambda err: console_errors.append(f"Page Error: {err}"))

            # 1.1 Dashboard Route (/)
            print("[Test] Navigating to / (Dashboard)...", flush=True)
            page.goto("http://127.0.0.1:4173/", wait_until="networkidle")
            assert page.is_visible("text=Dashboard Overview"), "Dashboard Overview title not visible"
            assert page.is_visible("text=November 2026 Overview"), "November 2026 Overview section not found"
            page.screenshot(path="e2e_screenshot_dashboard_1440.png")
            print("  ✓ Dashboard rendered successfully", flush=True)

            # 1.2 Accounts Route (/accounts)
            print("[Test] Navigating to /accounts...", flush=True)
            page.click("a[href='/accounts']")
            page.wait_for_selector("text=Accounts & Net Worth")
            assert page.is_visible("text=Consolidated Net Worth"), "Consolidated Net Worth not found"
            assert page.is_visible("text=HDFC Wealth Priority Savings"), "HDFC account not found"
            page.click("text=HDFC Wealth Priority Savings")
            page.screenshot(path="e2e_screenshot_accounts_1440.png")
            print("  ✓ Accounts page and drill-down rendered successfully", flush=True)

            # 1.3 Transactions Route (/transactions)
            print("[Test] Navigating to /transactions...", flush=True)
            page.click("a[href='/transactions']")
            page.wait_for_selector("text=Transactions Ledger")
            assert page.is_visible("text=Total Inflow"), "Total Inflow metric not found"
            assert page.is_visible("text=Export CSV"), "Export CSV button not found"
            page.click("button:has-text('income')")
            time.sleep(0.3)
            page.click("button:has-text('Reset Filters')")
            time.sleep(0.3)
            page.screenshot(path="e2e_screenshot_transactions_1440.png")
            print("  ✓ Transactions Ledger filtering rendered successfully", flush=True)

            # 1.4 Budgets Route (/budgets)
            print("[Test] Navigating to /budgets...", flush=True)
            page.click("a[href='/budgets']")
            page.wait_for_selector("text=Monthly Budgets")
            assert page.is_visible("text=November 2026 Monthly Budget Health"), "Budget health section not found"
            page.click("text=Dining & leisure")
            time.sleep(0.3)
            page.screenshot(path="e2e_screenshot_budgets_1440.png")
            print("  ✓ Monthly Budgets rendered successfully", flush=True)

            # 1.5 Savings Goals Route (/goals)
            print("[Test] Navigating to /goals...", flush=True)
            page.click("a[href='/goals']")
            page.wait_for_selector("text=Savings Goals & Milestones")
            assert page.is_visible("text=Total Capital Allocated"), "Total capital metric not found"
            page.screenshot(path="e2e_screenshot_goals_1440.png")
            print("  ✓ Savings Goals rendered successfully", flush=True)

            # 1.6 Recurring Payments Route (/recurring)
            print("[Test] Navigating to /recurring...", flush=True)
            page.click("a[href='/recurring']")
            page.wait_for_selector("text=Recurring Commitments")
            assert page.is_visible("text=Normalized Monthly Outflow"), "Normalized monthly outflow metric not found"
            mark_paid_btn = page.locator("button:has-text('Mark Paid')").first
            if mark_paid_btn.is_visible():
                mark_paid_btn.click()
                time.sleep(0.5)
                assert page.is_visible("text=Paid"), "Paid toast notification did not appear"
            page.screenshot(path="e2e_screenshot_recurring_1440.png")
            print("  ✓ Recurring Payments with 'Mark as Paid' executed successfully", flush=True)

            # 1.7 Financial Planning Route (/planning)
            print("[Test] Navigating to /planning...", flush=True)
            page.click("a[href='/planning']")
            page.wait_for_selector("text=Financial Planning & Safe-to-Spend")
            assert page.is_visible("text=Safe-to-Spend Metric"), "Safe-to-Spend badge not found"
            page.click("button:has-text('3 Months')")
            time.sleep(0.3)
            page.screenshot(path="e2e_screenshot_planning_1440.png")
            print("  ✓ Financial Planning & Safe-to-Spend rendered successfully", flush=True)

            # 1.8 Analytics Route (/analytics)
            print("[Test] Navigating to /analytics...", flush=True)
            page.click("a[href='/analytics']")
            page.wait_for_selector("text=Financial Analytics & Trends")
            assert page.is_visible("text=Savings Rate"), "Savings Rate metric not found"
            page.click("button:has-text('3M')")
            time.sleep(0.3)
            page.screenshot(path="e2e_screenshot_analytics_1440.png")
            print("  ✓ Financial Analytics charts rendered successfully", flush=True)

            # 1.9 Academy Route (/academy)
            print("[Test] Navigating to /academy...", flush=True)
            page.click("a[href='/academy']")
            page.wait_for_selector("text=PocketWise Financial Academy")
            assert page.is_visible("text=Curriculum Progress"), "Curriculum progress not found"
            page.screenshot(path="e2e_screenshot_academy_1440.png")
            print("  ✓ Financial Academy catalog rendered successfully", flush=True)

            # 1.10 Lesson Details Route (/academy/banking-basics-101)
            print("[Test] Navigating to /academy/banking-basics-101...", flush=True)
            page.goto("http://127.0.0.1:4173/academy/banking-basics-101", wait_until="networkidle")
            page.wait_for_selector("h1:has-text('Understanding Indian Banking')")
            assert page.is_visible("text=Key Takeaways & Core Principles"), "Key Takeaways section missing"
            page.click("input[name='quiz-q1'][value='2']")
            page.click("input[name='quiz-q2'][value='1']")
            page.click("button:has-text('Submit Knowledge Check')")
            time.sleep(0.5)
            assert page.is_visible("text=Score: 100%"), "Quiz score 100% not displayed"
            page.screenshot(path="e2e_screenshot_lesson_1440.png")
            print("  ✓ Lesson Details and Quiz scoring verified successfully", flush=True)

            context.close()

            # --- 2. Mobile Viewport (390x844) ---
            print("\n--- Testing Mobile Viewport (390x844) ---", flush=True)
            mobile_context = browser.new_context(viewport={"width": 390, "height": 844})
            mobile_page = mobile_context.new_page()
            mobile_page.goto("http://127.0.0.1:4173/", wait_until="networkidle")

            menu_btn = mobile_page.locator("button[aria-label='Open navigation menu']")
            assert menu_btn.is_visible(), "Mobile hamburger button not visible"
            menu_btn.click()
            time.sleep(0.3)

            assert mobile_page.is_visible("nav a[href='/planning']"), "Mobile navigation drawer link not found"
            mobile_page.click("nav a[href='/planning']")
            time.sleep(0.5)
            assert mobile_page.is_visible("text=Financial Planning & Safe-to-Spend"), "Did not navigate to Planning on mobile"
            mobile_page.screenshot(path="e2e_screenshot_mobile_390.png")
            print("  ✓ Mobile drawer navigation verified successfully", flush=True)
            mobile_context.close()

            # --- 3. Tablet Viewport (768x1024) ---
            print("\n--- Testing Tablet Viewport (768x1024) ---", flush=True)
            tablet_context = browser.new_context(viewport={"width": 768, "height": 1024})
            tablet_page = tablet_context.new_page()
            tablet_page.goto("http://127.0.0.1:4173/analytics", wait_until="networkidle")
            assert tablet_page.is_visible("text=Financial Analytics & Trends"), "Analytics page failed on tablet"
            tablet_page.screenshot(path="e2e_screenshot_tablet_768.png")
            print("  ✓ Tablet layout verified successfully", flush=True)
            tablet_context.close()

            browser.close()

    finally:
        print("\n[E2E] Terminating preview server...", flush=True)
        try:
            server_process.terminate()
            server_process.kill()
        except Exception:
            pass

    print(f"\n[E2E] Completed with {len(console_errors)} console errors.", flush=True)
    if console_errors:
        print("Console errors detected:", flush=True)
        for err in console_errors:
            print(" ", err, flush=True)
        sys.exit(1)
    else:
        print("[E2E] ALL TESTS PASSED WITH 0 CONSOLE ERRORS!", flush=True)

if __name__ == "__main__":
    run_tests()
