import os
import sys
import time
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

SCREENSHOT_DIR = r"C:\Users\pvenk\Downloads\Excel_Project\docs"
F11_PATH = os.path.abspath("backend/data/test_images/f11.jpeg")
F10_PATH = os.path.abspath("backend/data/test_images/f10.jpg")

def run():
    print("=== TESTING BOTH EDIBLE (f10) AND INEDIBLE (f11) FOOD INTAKE ===")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 950})
        page = context.new_page()

        # Test 1: f11 (Inedible Waste)
        print("\n--- Test 1: Uploading f11.jpeg (Inedible Waste) ---")
        page.goto("http://localhost:5173/", wait_until="networkidle")
        page.click("text=Start Donating")
        page.wait_for_selector("text=Support the fund")
        page.set_input_files("input[type='file']", F11_PATH)
        time.sleep(0.5)
        page.fill("input[placeholder*='Fresh Artisanal']", "Spoiled Mushroom Rice Consignment")
        time.sleep(0.5)
        page.click("button:has-text('Find Partners')")
        page.wait_for_selector("text=AI Intake & Model Verification", timeout=35000)
        time.sleep(2)

        shot_f11 = os.path.join(SCREENSHOT_DIR, "verified_f11_inedible_results.png")
        page.screenshot(path=shot_f11, full_page=True)
        print(f"Captured Inedible Result Screenshot: {shot_f11}")

        # Test 2: f10 (Edible Meal)
        print("\n--- Test 2: Uploading f10.jpg (Edible Rice Bowl) ---")
        page.goto("http://localhost:5173/", wait_until="networkidle")
        page.click("text=Start Donating")
        page.wait_for_selector("text=Support the fund")
        page.set_input_files("input[type='file']", F10_PATH)
        time.sleep(0.5)
        page.fill("input[placeholder*='Fresh Artisanal']", "Fresh Vegetable Brown Rice Bowls")
        time.sleep(0.5)
        page.click("button:has-text('Find Partners')")
        page.wait_for_selector("text=AI Intake & Model Verification", timeout=35000)
        time.sleep(2)

        shot_f10 = os.path.join(SCREENSHOT_DIR, "verified_f10_edible_results.png")
        page.screenshot(path=shot_f10, full_page=True)
        print(f"Captured Edible Result Screenshot: {shot_f10}")

        browser.close()

    print("\n=== VERIFICATION FINISHED ===")

if __name__ == "__main__":
    run()
