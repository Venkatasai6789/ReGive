import os
import sys
import time
from playwright.sync_api import sync_playwright

SCREENSHOT_DIR = r"C:\Users\pvenk\.gemini\antigravity\brain\42ec04d9-63b0-4078-a67a-699b038bca61"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

def run_tests():
    console_errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        # 1. Desktop Test (1440x950)
        context = browser.new_context(viewport={"width": 1440, "height": 950})
        page = context.new_page()
        page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type in ["error"] else None)

        print("Navigating to http://localhost:5173/...")
        page.goto("http://localhost:5173/", wait_until="networkidle")
        time.sleep(1)

        # Screen 01: Donor Home Desktop
        shot_home_desktop = os.path.join(SCREENSHOT_DIR, "screen01_home_desktop.png")
        page.screenshot(path=shot_home_desktop, full_page=True)
        print(f"Captured: {shot_home_desktop}")

        # Screen 02: Navigate to Create Donation
        page.click("text=Start Donating")
        page.wait_for_selector("text=Support the fund")
        time.sleep(0.5)

        shot_create_initial = os.path.join(SCREENSHOT_DIR, "screen02_create_initial.png")
        page.screenshot(path=shot_create_initial, full_page=True)
        print(f"Captured: {shot_create_initial}")

        # Click preset "Fresh Bakery Loaves"
        print("Selecting preset 'Fresh Bakery Loaves'...")
        page.click("text=Fresh Bakery Loaves")
        time.sleep(0.5)

        # Click "Analyse Food Donation & Find Partners"
        print("Clicking submission button (triggering real PyTorch CLIP & BLIP models)...")
        page.click("button:has-text('Find Partners')")

        # Wait for AI processing to complete and partner section to appear
        print("Waiting for AI analysis and partner recommendations from FastAPI backend...")
        page.wait_for_selector("text=Recommended for your donation.", timeout=25000)
        time.sleep(1)

        shot_create_results = os.path.join(SCREENSHOT_DIR, "screen02_create_ai_results.png")
        page.screenshot(path=shot_create_results, full_page=True)
        print(f"Captured: {shot_create_results}")

        # Open Partner Detail Drawer
        print("Opening partner details drawer...")
        page.click("button:has-text('View Details') >> nth=0")
        page.wait_for_selector("text=Intake Office Contacts")
        time.sleep(0.5)

        shot_partner_drawer = os.path.join(SCREENSHOT_DIR, "screen02_partner_drawer.png")
        page.screenshot(path=shot_partner_drawer)
        print(f"Captured: {shot_partner_drawer}")

        # Close drawer using either the close button or the footer button
        print("Closing drawer...")
        page.click("button:has-text('Close'), button:has-text('Partner Selected (Close)')")
        time.sleep(0.5)

        # Open confirmation modal
        print("Opening confirmation modal...")
        page.click("button:has-text('Proceed to Confirm Donation')")
        page.wait_for_selector("text=Confirm your donation")
        time.sleep(0.5)

        shot_confirm_modal = os.path.join(SCREENSHOT_DIR, "screen02_confirm_modal.png")
        page.screenshot(path=shot_confirm_modal)
        print(f"Captured: {shot_confirm_modal}")

        # Confirm donation
        print("Submitting donation...")
        page.click("button:has-text('Confirm & Dispatch Intake')")
        page.wait_for_selector("text=Donation successfully submitted!")
        time.sleep(0.5)

        shot_confirm_success = os.path.join(SCREENSHOT_DIR, "screen02_confirm_success.png")
        page.screenshot(path=shot_confirm_success)
        print(f"Captured: {shot_confirm_success}")

        # Navigate to Screen 03: My Donations
        print("Navigating to My Donations...")
        page.click("button:has-text('View My Donations & Track Status')")
        page.wait_for_selector("text=My Donations")
        time.sleep(0.8)

        shot_donations_desktop = os.path.join(SCREENSHOT_DIR, "screen03_donations_desktop.png")
        page.screenshot(path=shot_donations_desktop, full_page=True)
        print(f"Captured: {shot_donations_desktop}")

        # Open tracking drawer on the first donation
        print("Opening donation tracking drawer...")
        page.click("text=View & Track >> nth=0")
        page.wait_for_selector("text=5-Stage Journey Timeline")
        time.sleep(0.5)

        shot_tracking_drawer = os.path.join(SCREENSHOT_DIR, "screen03_tracking_drawer.png")
        page.screenshot(path=shot_tracking_drawer)
        print(f"Captured: {shot_tracking_drawer}")

        # Close tracking drawer
        page.click("button:has-text('Close Tracking Drawer')")
        time.sleep(0.5)

        # Test tabs
        print("Testing tab filtering...")
        page.click("button:has-text('Accepted / Scheduled')")
        time.sleep(0.3)
        page.click("button:has-text('All Donations')")
        time.sleep(0.3)

        # 2. Tablet Responsive Test (768x1024)
        print("Testing tablet viewport...")
        tablet_context = browser.new_context(viewport={"width": 768, "height": 1024})
        tablet_page = tablet_context.new_page()
        tablet_page.goto("http://localhost:5173/", wait_until="networkidle")
        time.sleep(0.5)
        shot_tablet = os.path.join(SCREENSHOT_DIR, "screen01_home_tablet.png")
        tablet_page.screenshot(path=shot_tablet, full_page=True)
        print(f"Captured: {shot_tablet}")
        tablet_context.close()

        # 3. Mobile Responsive Test (390x844 - iPhone 14)
        print("Testing mobile viewport...")
        mobile_context = browser.new_context(viewport={"width": 390, "height": 844})
        mobile_page = mobile_context.new_page()
        mobile_page.goto("http://localhost:5173/", wait_until="networkidle")
        time.sleep(0.5)
        shot_mobile_home = os.path.join(SCREENSHOT_DIR, "screen01_home_mobile.png")
        mobile_page.screenshot(path=shot_mobile_home, full_page=True)
        print(f"Captured: {shot_mobile_home}")

        # Mobile Create screen
        mobile_page.click("text=Start Donating")
        mobile_page.wait_for_selector("text=Support the fund")
        time.sleep(0.5)
        shot_mobile_create = os.path.join(SCREENSHOT_DIR, "screen02_create_mobile.png")
        mobile_page.screenshot(path=shot_mobile_create, full_page=True)
        print(f"Captured: {shot_mobile_create}")

        # Mobile My Donations
        mobile_page.goto("http://localhost:5173/", wait_until="networkidle")
        mobile_page.click("button[aria-label='Toggle navigation']")
        time.sleep(0.3)
        mobile_page.click("div.md\\:hidden button:has-text('My Donations')")
        mobile_page.wait_for_selector("text=Keep track of your contributions")
        time.sleep(0.5)
        shot_mobile_donations = os.path.join(SCREENSHOT_DIR, "screen03_donations_mobile.png")
        mobile_page.screenshot(path=shot_mobile_donations, full_page=True)
        print(f"Captured: {shot_mobile_donations}")
        mobile_context.close()

        context.close()
        browser.close()

    print("\n--- CONSOLE LOGS & WARNINGS ---")
    if not console_errors:
        print("ZERO console errors recorded! 100% clean runtime.")
    else:
        for err in console_errors:
            print(err)

if __name__ == "__main__":
    run_tests()
