import os
import time
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\pvenk\.gemini\antigravity\brain\42ec04d9-63b0-4078-a67a-699b038bca61"
os.makedirs(ARTIFACT_DIR, exist_ok=True)

def capture_screenshots():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Desktop viewport
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("Navigating to http://localhost:5173 ...")
        page.goto("http://localhost:5173", wait_until="networkidle")
        time.sleep(2)

        # 1. Switch to Partner Portal (Annapoorna Trust)
        print("Switching to Partner Portal (NGO)...")
        # Click on user profile menu or trigger switch
        # We can directly click the profile dropdown in header
        profile_btn = page.locator("header button:has(div:has-text('ER'))")
        if profile_btn.count() > 0:
            profile_btn.click()
            time.sleep(0.5)
            ngo_btn = page.locator("button:has-text('Annapoorna Trust')")
            if ngo_btn.count() > 0:
                ngo_btn.click()
                time.sleep(1.5)

        # Screenshot 1: Partner Dashboard (NGO)
        dash_path = os.path.join(ARTIFACT_DIR, "screen01_partner_dashboard_ngo.png")
        page.screenshot(path=dash_path, full_page=False)
        print(f"Captured: {dash_path}")

        # Screenshot 2: Switch to Recycler Dashboard
        partner_profile_btn = page.locator("header button:has-text('Annapoorna')")
        if partner_profile_btn.count() > 0:
            partner_profile_btn.click()
            time.sleep(0.5)
            rec_btn = page.locator("button:has-text('Green Earth Compost')")
            if rec_btn.count() > 0:
                rec_btn.click()
                time.sleep(1.5)

        rec_dash_path = os.path.join(ARTIFACT_DIR, "screen01_partner_dashboard_recycler.png")
        page.screenshot(path=rec_dash_path, full_page=False)
        print(f"Captured: {rec_dash_path}")

        # Switch back to Annapoorna Trust for requests and drawer
        partner_profile_btn2 = page.locator("header button:has-text('Green Earth')")
        if partner_profile_btn2.count() > 0:
            partner_profile_btn2.click()
            time.sleep(0.5)
            ngo_btn2 = page.locator("button:has-text('Annapoorna Trust')")
            if ngo_btn2.count() > 0:
                ngo_btn2.click()
                time.sleep(1.5)

        # Screenshot 3: Navigate to Screen 02 - Donation Requests
        print("Navigating to Screen 02: Donation Requests...")
        page.locator("nav button:has-text('Donation Requests')").click()
        time.sleep(1.5)
        requests_path = os.path.join(ARTIFACT_DIR, "screen02_partner_donation_requests.png")
        page.screenshot(path=requests_path, full_page=False)
        print(f"Captured: {requests_path}")

        # Screenshot 4: Open Details Drawer on first row
        print("Opening Details Drawer...")
        detail_btn = page.locator("table tbody tr button:has-text('Details')").first
        if detail_btn.count() > 0:
            detail_btn.click()
            time.sleep(1.5)
            drawer_path = os.path.join(ARTIFACT_DIR, "screen02_partner_details_drawer.png")
            page.screenshot(path=drawer_path, full_page=False)
            print(f"Captured: {drawer_path}")

            # Close drawer
            page.locator("div.fixed button:has(svg.lucide-x)").first.click()
            time.sleep(1)

        # Screenshot 5: Navigate to Screen 03 - Collection & History
        print("Navigating to Screen 03: Collection & History...")
        page.locator("nav button:has-text('Collection & History')").click()
        time.sleep(1.5)
        history_path = os.path.join(ARTIFACT_DIR, "screen03_partner_collection_history.png")
        page.screenshot(path=history_path, full_page=False)
        print(f"Captured: {history_path}")

        # Responsive: Mobile view for Screen 02
        print("Capturing Mobile View...")
        page.set_viewport_size({"width": 390, "height": 844})
        time.sleep(1)
        mobile_path = os.path.join(ARTIFACT_DIR, "screen02_partner_mobile.png")
        page.screenshot(path=mobile_path, full_page=False)
        print(f"Captured: {mobile_path}")

        browser.close()
        print("Screenshots captured successfully!")

if __name__ == "__main__":
    capture_screenshots()
