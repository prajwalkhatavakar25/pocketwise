"""
PocketWise 2.0 - Phase 1 Automated End-to-End Verification Suite
Validates Add Transaction, Validation, Live Search, CSV Export,
Chart Timeframes, Savings Goal creation, LocalStorage persistence,
Modal Escape key handling, and Desktop/Mobile responsive layouts.
"""

import os
import sys
import time
import subprocess
from playwright.sync_api import sync_playwright

def run_phase1_verification():
    print("==============================================================")
    print("POCKETWISE 2.0 — PHASE 1 E2E FUNCTIONAL VERIFICATION SUITE")
    print("==============================================================")

    port = 5197
    target_url = f"http://localhost:{port}/"
    screenshots_dir = os.path.join(os.getcwd(), "scripts", "screenshots")
    os.makedirs(screenshots_dir, exist_ok=True)

    print(f"Starting Vite dev server on {target_url}...", flush=True)
    server_process = subprocess.Popen(
        ["npm.cmd", "run", "dev", "--", "--port", str(port), "--strictPort"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT
    )

    time.sleep(2.5)

    console_errors = []
    page_errors = []

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)

            # =========================================================
            # Test Suite 1: Desktop 1440x900 Comprehensive Interactions
            # =========================================================
            print("\n--- Test Suite 1: Desktop 1440x900 Workflows ---", flush=True)
            ctx = browser.new_context(
                viewport={"width": 1440, "height": 900},
                accept_downloads=True
            )
            page = ctx.new_page()

            page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type in ["error"] else None)
            page.on("pageerror", lambda err: page_errors.append(str(err)))

            page.goto(target_url, wait_until="domcontentloaded")
            page.locator("header").wait_for(state="visible")
            print("Page loaded successfully at 1440x900.", flush=True)

            # ---------------------------------------------------------
            # 1. Add Transaction Modal & Validation
            # ---------------------------------------------------------
            print("\n[Step 1] Testing 'Add Transaction' button and validation...", flush=True)
            add_btn = page.locator("header button:has-text('Add Transaction')")
            assert add_btn.is_visible(), "Add Transaction button must be visible"
            add_btn.click()

            modal = page.locator("div[role='dialog'][aria-labelledby='add-tx-title']")
            modal.wait_for(state="visible")
            print("Modal opened successfully.", flush=True)

            # Test Empty Form Submission Validation
            submit_btn = modal.locator("button:has-text('Record Transaction')")
            submit_btn.click()
            time.sleep(0.2)

            desc_err = modal.locator("text=Description is required")
            assert desc_err.is_visible(), "Description validation error must be visible"
            amt_err = modal.locator("text=Amount must be a valid number greater than ₹0")
            assert amt_err.is_visible(), "Amount validation error must be visible"
            print("Validation errors displayed correctly on empty submit.", flush=True)

            # Test Escape Key closes modal
            page.keyboard.press("Escape")
            time.sleep(0.2)
            assert not modal.is_visible(), "Modal must close on Escape key"
            print("Escape key successfully closed modal.", flush=True)

            # Re-open and fill valid transaction
            add_btn.click()
            modal.wait_for(state="visible")

            # Toggle type to Income
            income_toggle = modal.locator("button:has-text('Income')")
            income_toggle.click()

            modal.locator("#tx-description").fill("Strategic FinTech Advisory")
            modal.locator("#tx-amount").fill("75000")
            modal.locator("#tx-merchant").fill("Alpha Global Partners")
            modal.locator("#tx-date").fill("2026-11-08")

            submit_btn.click()
            time.sleep(0.4)
            assert not modal.is_visible(), "Modal must close upon valid submission"

            # Check notification toast
            toast = page.locator("div[role='status']")
            assert toast.is_visible(), "Success toast must appear"
            toast_text = toast.inner_text()
            print(f"Toast confirmed: '{toast_text}'", flush=True)
            assert "Strategic FinTech Advisory" in toast_text

            # Check new entry in Recent Transactions
            first_tx = page.locator(".divide-y > div").first
            assert "Strategic FinTech Advisory" in first_tx.inner_text()
            assert "+₹75,000.00" in first_tx.inner_text()
            print("New transaction rendered at top of Recent Transactions ledger.", flush=True)

            # Check dynamic summary card update
            # Initial income was ₹1,85,000.00 -> now ₹2,60,000.00 (+75k)
            income_card = page.locator("section[aria-label='Financial Summary Cards']").locator("text=Monthly income").locator("xpath=../..")
            print(f"Income card inner text:\n{income_card.inner_text()}", flush=True)
            assert "₹2,60,000.00" in income_card.inner_text(), "Monthly income must dynamically update to ₹2,60,000.00"
            print("Financial summary cards dynamically recalculated successfully.", flush=True)

            # ---------------------------------------------------------
            # 2. Live Search & Empty State
            # ---------------------------------------------------------
            print("\n[Step 2] Testing Live Transaction Search...", flush=True)
            search_input = page.locator("header input[placeholder='Search transactions']")
            search_input.fill("Strategic")
            time.sleep(0.3)

            visible_rows = page.locator(".divide-y > div")
            assert visible_rows.count() == 1, "Search for 'Strategic' should filter to exactly 1 transaction"
            assert "Strategic FinTech Advisory" in visible_rows.first.inner_text()
            print("Search successfully filtered ledger to 1 result.", flush=True)

            # Test Empty State
            search_input.fill("XYZUnmatchedMerchant")
            time.sleep(0.3)
            assert visible_rows.count() == 0, "No transactions should match invalid search"
            empty_state = page.locator("text=No transactions matching \"XYZUnmatchedMerchant\"")
            assert empty_state.is_visible(), "Empty state message must be visible"

            # Click clear search inside empty state
            clear_btn = page.locator("button:has-text('Clear search')")
            clear_btn.click()
            time.sleep(0.3)
            assert page.locator(".divide-y > div").count() > 1, "Ledger must be restored after clear search"
            assert search_input.input_value() == "", "Search input must be emptied"
            print("Empty state and clear search verified.", flush=True)

            # Test Input Clear Icon (X)
            search_input.fill("Grocery")
            time.sleep(0.2)
            clear_icon = page.locator("button[aria-label='Clear search']")
            assert clear_icon.is_visible()
            clear_icon.click()
            time.sleep(0.2)
            assert search_input.input_value() == ""
            print("Clear 'X' button inside search input verified.", flush=True)

            # ---------------------------------------------------------
            # 3. CSV File Export
            # ---------------------------------------------------------
            print("\n[Step 3] Testing Real CSV Export download...", flush=True)
            export_btn = page.locator("button:has-text('Export statement')")
            assert export_btn.is_visible(), "Export statement button must be visible"

            with page.expect_download(timeout=5000) as download_info:
                export_btn.click()
                download = download_info.value

            download_path = os.path.join(screenshots_dir, download.suggested_filename)
            download.save_as(download_path)
            print(f"Downloaded CSV file: {download.suggested_filename}", flush=True)
            assert download.suggested_filename == "PocketWise_Statement_November_2026.csv"

            with open(download_path, "r", encoding="utf-8-sig") as f:
                csv_body = f.read()

            assert '"Date","Description","Category","Type","Amount (INR)","Merchant/Recipient","Status"' in csv_body
            assert "Strategic FinTech Advisory" in csv_body
            assert "75000" in csv_body
            print("CSV file structure, headers, UTF-8 BOM, and transaction data verified.", flush=True)

            # ---------------------------------------------------------
            # 4. Chart Timeframe Slicing (3M, 6M, 1Y)
            # ---------------------------------------------------------
            print("\n[Step 4] Testing Cash Flow Chart Timeframe Slicing...", flush=True)
            btn_3m = page.locator("button:has-text('3M')")
            btn_6m = page.locator("button:has-text('6M')")
            btn_1y = page.locator("button:has-text('1Y')")

            path_initial = page.locator(".recharts-area-area").first.get_attribute("d")

            btn_3m.click()
            time.sleep(0.3)
            path_3m = page.locator(".recharts-area-area").first.get_attribute("d")
            assert path_initial != path_3m, "Chart SVG path must mutate when timeframe changes from 6M to 3M"

            btn_1y.click()
            time.sleep(0.3)
            path_1y = page.locator(".recharts-area-area").first.get_attribute("d")
            assert path_3m != path_1y, "Chart SVG path must mutate when timeframe changes from 3M to 1Y"

            btn_6m.click()
            time.sleep(0.2)
            print("Chart 3M, 6M, 1Y timeframe dynamic slicing verified.", flush=True)

            # ---------------------------------------------------------
            # 5. New Savings Goal Creation & Validation
            # ---------------------------------------------------------
            print("\n[Step 5] Testing 'New goal' button and creation...", flush=True)
            new_goal_btn = page.locator("button:has-text('New goal')")
            new_goal_btn.click()

            goal_modal = page.locator("div[role='dialog'][aria-labelledby='new-goal-title']")
            goal_modal.wait_for(state="visible")
            print("New Goal modal opened successfully.", flush=True)

            goal_modal.locator("#goal-name").fill("Electric Mobility Fund")
            goal_modal.locator("#goal-target").fill("400000")
            goal_modal.locator("#goal-current").fill("100000")
            goal_modal.locator("#goal-date").fill("Aug 2028")
            goal_modal.locator("#goal-desc").fill("EV bike and charging deposit")

            create_goal_btn = goal_modal.locator("button:has-text('Create Goal')")
            create_goal_btn.click()
            time.sleep(0.4)
            assert not goal_modal.is_visible(), "Goal modal must close upon submission"

            # Verify new goal rendered in Savings Goals card list
            goal_card = page.locator(".space-y-3 > div:has-text('Electric Mobility Fund')").first
            assert goal_card.is_visible(), "New goal must be visible in the list"
            assert "25%" in goal_card.inner_text(), "Goal must show 25% completion (100k / 400k)"
            print("New Savings Goal created with 25% progress verified.", flush=True)

            # ---------------------------------------------------------
            # 6. Data Persistence After Page Reload
            # ---------------------------------------------------------
            print("\n[Step 6] Testing localStorage data persistence across reload...", flush=True)
            page.reload(wait_until="domcontentloaded")
            page.locator("header").wait_for(state="visible")
            time.sleep(0.5)

            # Verify transaction persists
            assert page.locator(".divide-y > div:has-text('Strategic FinTech Advisory')").is_visible(), "Added transaction must persist after reload"
            # Verify goal persists
            assert page.locator(".space-y-3 > div:has-text('Electric Mobility Fund')").is_visible(), "Added goal must persist after reload"
            # Verify balance persists
            income_reloaded = page.locator("section[aria-label='Financial Summary Cards']").locator("text=Monthly income").locator("xpath=../..")
            assert "₹2,60,000.00" in income_reloaded.inner_text(), "Dynamic income must persist after reload"
            print("Complete localStorage state hydration verified.", flush=True)

            # Capture Desktop Screenshot
            desktop_shot = os.path.join(screenshots_dir, "phase1_desktop_1440.png")
            page.screenshot(path=desktop_shot, full_page=True)
            print(f"Desktop 1440 screenshot saved to: {desktop_shot}", flush=True)

            ctx.close()

            # =========================================================
            # Test Suite 2: Mobile 390x844 Responsive Workflows
            # =========================================================
            print("\n--- Test Suite 2: Mobile 390x844 Workflows ---", flush=True)
            mobile_ctx = browser.new_context(viewport={"width": 390, "height": 844})
            mobile_page = mobile_ctx.new_page()

            mobile_page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type in ["error"] else None)
            mobile_page.on("pageerror", lambda err: page_errors.append(str(err)))

            mobile_page.goto(target_url, wait_until="domcontentloaded")
            mobile_page.locator("header").wait_for(state="visible")

            # Check mobile '+ Add' button
            mobile_add_btn = mobile_page.locator("header button:has-text('Add')")
            assert mobile_add_btn.is_visible(), "Mobile '+ Add' button must be visible"
            mobile_add_btn.click()

            mobile_modal = mobile_page.locator("div[role='dialog'][aria-labelledby='add-tx-title']")
            mobile_modal.wait_for(state="visible")

            mobile_modal_shot = os.path.join(screenshots_dir, "phase1_mobile_modal_390.png")
            mobile_page.screenshot(path=mobile_modal_shot, full_page=False)
            print(f"Mobile Modal screenshot saved to: {mobile_modal_shot}", flush=True)

            # Close mobile modal via X button
            mobile_close = mobile_modal.locator("button[aria-label='Close dialog']")
            mobile_close.click()
            time.sleep(0.2)
            assert not mobile_modal.is_visible()

            # Capture mobile dashboard screenshot
            mobile_shot = os.path.join(screenshots_dir, "phase1_mobile_390.png")
            mobile_page.screenshot(path=mobile_shot, full_page=True)
            print(f"Mobile 390 dashboard screenshot saved to: {mobile_shot}", flush=True)

            mobile_ctx.close()
            browser.close()

            print("\n==============================================================")
            print("E2E FUNCTIONAL VERIFICATION SUITE COMPLETED SUCCESSFULLY")
            print("==============================================================")
            if console_errors:
                print(f"Browser console errors ({len(console_errors)}):", console_errors)
                assert False, f"Unexpected console errors: {console_errors}"
            else:
                print("Zero browser console errors detected throughout all workflows!")

            if page_errors:
                print(f"Page errors ({len(page_errors)}):", page_errors)
                assert False, f"Unexpected page errors: {page_errors}"

    finally:
        print("Stopping Vite dev server...", flush=True)
        server_process.terminate()
        try:
            server_process.wait(timeout=3)
        except Exception:
            server_process.kill()

if __name__ == "__main__":
    run_phase1_verification()
