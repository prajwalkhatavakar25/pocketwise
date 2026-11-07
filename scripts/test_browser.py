import os
import sys
import time
import subprocess
from playwright.sync_api import sync_playwright

def run_tests():
    print("Starting Vite server for browser testing...")
    env = os.environ.copy()
    server_process = subprocess.Popen(
        ["cmd.exe", "/c", "npx", "vite", "--port", "5199", "--strictPort"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        env=env,
    )

    time.sleep(3)
    target_url = "http://localhost:5199/"
    print(f"Testing target: {target_url}")

    screenshots_dir = os.path.join(os.path.dirname(__file__), "screenshots")
    os.makedirs(screenshots_dir, exist_ok=True)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)

            # ---------------------------------------------------------
            # Test 1: Desktop Viewport at 1440x900
            # ---------------------------------------------------------
            print("\n--- Testing Desktop Viewport (1440x900) ---")
            ctx_1440 = browser.new_context(viewport={"width": 1440, "height": 900})
            page_1440 = ctx_1440.new_page()

            console_errors = []
            page_1440.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
            page_1440.on("pageerror", lambda err: console_errors.append(str(err)))

            page_1440.goto(target_url, wait_until="networkidle", timeout=15000)

            title = page_1440.title()
            print(f"Page title: {title}")
            assert "PocketWise" in title, f"Title should contain PocketWise, got {title}"

            # Check contextual title
            overview_heading = page_1440.locator("text=November 2026 Overview")
            assert overview_heading.is_visible(), "November 2026 Overview heading must be visible"

            # Check that 'Welcome back!' was removed
            welcome_el = page_1440.locator("text=Welcome back!")
            assert welcome_el.count() == 0, "'Welcome back!' greeting should be removed"

            # Check 4 StatCards
            stat_cards = page_1440.locator("section[aria-label='Financial Summary Cards'] > div > div")
            count = stat_cards.count()
            print(f"Financial summary cards found: {count}")
            assert count == 4, f"Expected 4 stat cards, found {count}"

            # Check that stat card icon boxes were removed
            icon_boxes = stat_cards.locator("svg.h-5.w-5")
            assert icon_boxes.count() == 0, "Stat cards should not have decorative icon boxes"

            # Check Recharts SVG visibility
            chart = page_1440.locator(".recharts-responsive-container")
            assert chart.is_visible(), "Recharts container must be visible"

            # Check that date selector says November 2026
            header_date = page_1440.locator("header").get_by_text("November 2026")
            assert header_date.is_visible(), "Header date should display November 2026"

            search_pad = page_1440.locator("header input").evaluate("el => window.getComputedStyle(el).paddingLeft")
            print(f"Header input computed paddingLeft: {search_pad}")

            # Capture 1440 screenshot
            desktop_shot = os.path.join(screenshots_dir, "dashboard_desktop_1440.png")
            page_1440.screenshot(path=desktop_shot, full_page=True)
            print(f"Desktop 1440 screenshot saved to: {desktop_shot}")
            ctx_1440.close()

            # ---------------------------------------------------------
            # Test 2: Wide Desktop Viewport at 1704x900
            # ---------------------------------------------------------
            print("\n--- Testing Wide Desktop Viewport (1704x900) ---")
            ctx_1704 = browser.new_context(viewport={"width": 1704, "height": 900})
            page_1704 = ctx_1704.new_page()
            page_1704.goto(target_url, wait_until="networkidle", timeout=15000)

            # Verify no horizontal scroll
            body_scroll_width_1704 = page_1704.evaluate("document.body.scrollWidth")
            window_inner_width_1704 = page_1704.evaluate("window.innerWidth")
            print(f"Wide 1704 body scroll width: {body_scroll_width_1704}, inner width: {window_inner_width_1704}")
            assert body_scroll_width_1704 <= window_inner_width_1704 + 1, "No horizontal overflow permitted on 1704px"

            wide_shot = os.path.join(screenshots_dir, "dashboard_wide_1704.png")
            page_1704.screenshot(path=wide_shot, full_page=True)
            print(f"Wide 1704 screenshot saved to: {wide_shot}")
            ctx_1704.close()

            # ---------------------------------------------------------
            # Test 3: Mobile Viewport at 390x844
            # ---------------------------------------------------------
            print("\n--- Testing Mobile Viewport (390x844) ---")
            ctx_390 = browser.new_context(viewport={"width": 390, "height": 844})
            page_390 = ctx_390.new_page()
            page_390.goto(target_url, wait_until="networkidle", timeout=15000)

            # Verify no horizontal scroll on mobile
            body_scroll_width_390 = page_390.evaluate("document.body.scrollWidth")
            window_inner_width_390 = page_390.evaluate("window.innerWidth")
            print(f"Mobile 390 body scroll width: {body_scroll_width_390}, inner width: {window_inner_width_390}")
            assert body_scroll_width_390 <= window_inner_width_390 + 1, "No horizontal overflow permitted on mobile"

            # Check hamburger button
            menu_btn = page_390.locator("button[aria-label='Open navigation menu']")
            assert menu_btn.is_visible(), "Mobile hamburger button must be visible"

            # Capture mobile dashboard with closed drawer first
            mobile_shot = os.path.join(screenshots_dir, "dashboard_mobile_390.png")
            page_390.screenshot(path=mobile_shot, full_page=True)
            print(f"Mobile 390 dashboard screenshot saved to: {mobile_shot}")

            # Check body overflow before opening drawer
            overflow_before = page_390.evaluate("document.body.style.overflow")
            assert overflow_before == "", "Body overflow should be empty initially"

            # Click hamburger to open mobile drawer
            menu_btn.click()
            time.sleep(0.3)

            # Check body overflow lock
            overflow_locked = page_390.evaluate("document.body.style.overflow")
            print(f"Body overflow when drawer is open: '{overflow_locked}'")
            assert overflow_locked == "hidden", "Body overflow must be locked to 'hidden' when drawer is open"

            # Check close button
            close_btn = page_390.locator("button[aria-label='Close navigation']")
            assert close_btn.is_visible(), "Close button must be visible when drawer is open"

            # Capture drawer open screenshot
            drawer_shot = os.path.join(screenshots_dir, "dashboard_mobile_drawer_390.png")
            page_390.screenshot(path=drawer_shot, full_page=True)
            print(f"Mobile drawer screenshot saved to: {drawer_shot}")

            # Press Escape key to close drawer (accessibility test)
            page_390.keyboard.press("Escape")
            time.sleep(0.3)

            # Check body overflow unlocked
            overflow_unlocked = page_390.evaluate("document.body.style.overflow")
            print(f"Body overflow after closing with Escape: '{overflow_unlocked}'")
            assert overflow_unlocked == "", "Body overflow must be restored after drawer closes"

            ctx_390.close()

            browser.close()

            if console_errors:
                print(f"\nConsole errors detected ({len(console_errors)}):", console_errors)
            else:
                print("\nZero browser console errors detected during testing!")

    finally:
        print("Stopping Vite server...")
        server_process.terminate()
        try:
            server_process.wait(timeout=3)
        except Exception:
            server_process.kill()

if __name__ == "__main__":
    run_tests()
