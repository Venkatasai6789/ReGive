import os
import sys
import time
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

TEST_F11 = os.path.abspath("backend/data/test_images/f11.jpeg")

def test_f11():
    print(f"Testing f11 upload: {TEST_F11}")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 950})
        page = context.new_page()

        console_logs = []
        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))

        page.goto("http://localhost:5173/", wait_until="networkidle")
        page.click("text=Start Donating")
        page.wait_for_selector("text=Support the fund")

        # Upload f11.jpeg
        page.set_input_files("input[type='file']", TEST_F11)
        time.sleep(0.5)

        # Fill title
        page.fill("input[placeholder*='Fresh Artisanal']", "Test Consignment F11")
        time.sleep(0.5)

        # Click Find Partners
        print("Submitting F11 to AI analysis...")
        page.click("button:has-text('Find Partners')")

        # Wait for results
        page.wait_for_selector("text=AI Intake & Model Verification", timeout=35000)
        time.sleep(2)

        # Check what is displayed
        texts = page.locator("div.space-y-6").all_inner_texts()
        print("AI Results Section inner texts:")
        for t in texts:
            print("---")
            print(t[:400])

        shot_f11 = r"C:\Users\pvenk\.gemini\antigravity\brain\42ec04d9-63b0-4078-a67a-699b038bca61\f11_test_output.png"
        page.screenshot(path=shot_f11, full_page=True)
        print(f"Saved screenshot: {shot_f11}")

        print("\nBrowser console logs:")
        for log in console_logs:
            print("  ", log)

        browser.close()

if __name__ == "__main__":
    test_f11()
