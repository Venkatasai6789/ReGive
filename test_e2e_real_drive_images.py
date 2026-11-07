import os
import sys
import time
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

SCREENSHOT_DIR = r"C:\Users\pvenk\.gemini\antigravity\brain\42ec04d9-63b0-4078-a67a-699b038bca61"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)
TEST_IMG = os.path.abspath("backend/data/test_images/f10.jpg")

def run():
    print("=== PLAYWRIGHT E2E VERIFICATION WITH REAL DRIVE IMAGE ===")
    print(f"Target image: {TEST_IMG} (exists: {os.path.exists(TEST_IMG)})")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 950})
        page = context.new_page()

        # Capture console messages
        page.on("console", lambda msg: print(f"[Browser {msg.type}] {msg.text}") if msg.type in ["error"] else None)

        # 1. Screen 01: Home
        print("\n1. Navigating to Donor Home (http://localhost:5173/)...")
        page.goto("http://localhost:5173/", wait_until="networkidle")
        time.sleep(1)
        shot_home = os.path.join(SCREENSHOT_DIR, "screen01_home_desktop.png")
        page.screenshot(path=shot_home, full_page=True)
        print(f"   ✓ Home page loaded and screenshot saved: {shot_home}")

        # 2. Screen 02: Create Donation
        print("\n2. Navigating to Create Donation...")
        page.click("text=Start Donating")
        page.wait_for_selector("text=Support the fund")
        time.sleep(0.5)

        # Check stream pills
        streams = page.query_selector_all("button:has-text('Prepared Meals'), button:has-text('Bakery & Bread'), button:has-text('Fresh Produce'), button:has-text('Packaged Pantry')")
        print(f"   ✓ Verified food stream pills count: {len(streams)}")

        # Upload real Drive image f10.jpg
        print(f"   Uploading actual food image: {TEST_IMG}")
        page.set_input_files("input[type='file']", TEST_IMG)
        time.sleep(1)

        # Fill title and notes
        page.fill("input[placeholder*='Fresh Artisanal']", "Surplus Veggie Rice Bowls")
        page.fill("input[placeholder*='Packaged in sealed']", "Sealed warm stainless catering pans, prepared 2 hours ago")
        time.sleep(0.5)

        # Screenshot initial create screen
        shot_create_init = os.path.join(SCREENSHOT_DIR, "screen02_create_initial.png")
        page.screenshot(path=shot_create_init, full_page=True)
        print(f"   ✓ Initial create screen screenshot saved: {shot_create_init}")

        # Trigger AI Model Pipeline
        print("\n3. Triggering Real AI Model Pipeline (POST /api/donations/analyze)...")
        page.click("button:has-text('Find Partners')")

        # Wait for AI analysis and partner recommendation results
        print("   Waiting for PyTorch CLIP & BLIP neural inference...")
        page.wait_for_selector("text=Recommended for your donation.", timeout=35000)
        time.sleep(1.5)

        # Verify AI output in UI
        caption_el = page.locator("p.italic").first
        caption_text = caption_el.inner_text() if caption_el else "N/A"
        print(f"   ✓ Model Caption displayed in UI: {caption_text}")

        shot_ai_results = os.path.join(SCREENSHOT_DIR, "screen02_create_ai_results.png")
        page.screenshot(path=shot_ai_results, full_page=True)
        print(f"   ✓ AI results screenshot saved: {shot_ai_results}")

        # Open partner drawer to inspect verified NGO
        print("\n4. Inspecting Partner Recommendation Drawer...")
        page.click("button:has-text('View Details') >> nth=0")
        page.wait_for_selector("text=Intake Office Contacts")
        time.sleep(0.5)
        shot_partner = os.path.join(SCREENSHOT_DIR, "screen02_partner_drawer.png")
        page.screenshot(path=shot_partner)
        print(f"   ✓ Partner drawer screenshot saved: {shot_partner}")

        # Close drawer
        page.click("button:has-text('Partner Selected (Close)'), button:has-text('Close')")
        time.sleep(0.5)

        # Proceed to Confirm Modal
        print("\n5. Proceeding to Confirm Modal...")
        page.click("button:has-text('Proceed to Confirm Donation')")
        page.wait_for_selector("text=Confirm your donation")
        time.sleep(0.5)
        shot_modal = os.path.join(SCREENSHOT_DIR, "screen02_confirm_modal.png")
        page.screenshot(path=shot_modal)
        print(f"   ✓ Confirm modal screenshot saved: {shot_modal}")

        # Confirm and dispatch
        print("   Confirming donation and persisting to SQLite backend...")
        page.click("button:has-text('Confirm & Dispatch Intake')")
        page.wait_for_selector("text=Donation successfully submitted!")
        time.sleep(0.5)
        shot_success = os.path.join(SCREENSHOT_DIR, "screen02_confirm_success.png")
        page.screenshot(path=shot_success)
        print(f"   ✓ Success modal screenshot saved: {shot_success}")

        # Navigate to Screen 03: My Donations
        print("\n6. Navigating to Screen 03: My Donations...")
        page.click("button:has-text('View My Donations & Track Status')")
        page.wait_for_selector("text=My Donations")
        time.sleep(1)
        shot_donations = os.path.join(SCREENSHOT_DIR, "screen03_donations_desktop.png")
        page.screenshot(path=shot_donations, full_page=True)
        print(f"   ✓ My Donations ledger screenshot saved: {shot_donations}")

        # Open tracking timeline drawer
        print("   Opening 5-Stage Journey Timeline drawer...")
        page.click("text=View & Track >> nth=0")
        page.wait_for_selector("text=5-Stage Journey Timeline")
        time.sleep(0.5)
        shot_tracking = os.path.join(SCREENSHOT_DIR, "screen03_tracking_drawer.png")
        page.screenshot(path=shot_tracking)
        print(f"   ✓ Tracking drawer screenshot saved: {shot_tracking}")
        page.click("button:has-text('Close Tracking Drawer')")
        time.sleep(0.5)

        # 7. Mobile responsive verification
        print("\n7. Mobile Responsive Verification (390x844)...")
        mobile_ctx = browser.new_context(viewport={"width": 390, "height": 844})
        m_page = mobile_ctx.new_page()
        m_page.goto("http://localhost:5173/", wait_until="networkidle")
        time.sleep(0.5)
        shot_m_home = os.path.join(SCREENSHOT_DIR, "screen01_home_mobile.png")
        m_page.screenshot(path=shot_m_home, full_page=True)

        m_page.click("text=Start Donating")
        m_page.wait_for_selector("text=Support the fund")
        time.sleep(0.5)
        shot_m_create = os.path.join(SCREENSHOT_DIR, "screen02_create_mobile.png")
        m_page.screenshot(path=shot_m_create, full_page=True)

        m_page.goto("http://localhost:5173/", wait_until="networkidle")
        m_page.click("button[aria-label='Toggle navigation']")
        time.sleep(0.3)
        m_page.click("div.md\\:hidden button:has-text('My Donations')")
        m_page.wait_for_selector("text=Keep track of your contributions")
        time.sleep(0.5)
        shot_m_donations = os.path.join(SCREENSHOT_DIR, "screen03_donations_mobile.png")
        m_page.screenshot(path=shot_m_donations, full_page=True)
        print(f"   ✓ Mobile screenshots saved.")

        mobile_ctx.close()
        context.close()
        browser.close()

    print("\n=== PLAYWRIGHT E2E RUN FINISHED SUCCESSFULLY ===")

if __name__ == "__main__":
    run()
