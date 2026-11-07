import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        # 1. Unauthenticated Public Landing Page
        print("Capturing 01_unauthenticated_home...")
        await page.goto("http://localhost:5173", wait_until="networkidle")
        await page.screenshot(path="C:/Users/pvenk/.gemini/antigravity/brain/42ec04d9-63b0-4078-a67a-699b038bca61/auth_01_unauthenticated_home.png")

        # 2. Open Login Page
        print("Capturing 02_login_page...")
        await page.click("button:has-text('Log In')")
        await page.wait_for_selector("text=Welcome back")
        await page.screenshot(path="C:/Users/pvenk/.gemini/antigravity/brain/42ec04d9-63b0-4078-a67a-699b038bca61/auth_02_login_page.png")

        # 3. Log in as Donor (Ananya Sharma via 1-click demo button)
        print("Logging in as Donor Ananya Sharma...")
        await page.click("button:has-text('Ananya Sharma')")
        await page.click("button[type='submit']")
        await page.wait_for_selector("text=Give surplus food")
        await page.wait_for_timeout(1000)

        # Open profile dropdown to show real donor name & initials
        await page.click("button:has-text('Ananya')")
        await page.wait_for_timeout(500)
        await page.screenshot(path="C:/Users/pvenk/.gemini/antigravity/brain/42ec04d9-63b0-4078-a67a-699b038bca61/auth_03_donor_authenticated_profile.png")

        # 4. Sign out
        print("Signing out...")
        await page.click("text=Sign Out")
        await page.wait_for_selector("button:has-text('Log In')")
        await page.wait_for_timeout(500)

        # 5. Log in as NGO (Annapoorna Trust)
        print("Logging in as NGO Annapoorna Trust...")
        await page.click("button:has-text('Log In')")
        await page.wait_for_selector("text=Welcome back")
        await page.click("button:has-text('Food NGO')")
        await page.click("button:has-text('Annapoorna Trust')")
        await page.click("button[type='submit']")
        await page.wait_for_selector("text=Partner Portal")
        await page.wait_for_timeout(1000)

        # Open profile dropdown in partner view
        await page.click("button:has-text('Annapoorna')")
        await page.wait_for_timeout(500)
        await page.screenshot(path="C:/Users/pvenk/.gemini/antigravity/brain/42ec04d9-63b0-4078-a67a-699b038bca61/auth_04_ngo_partner_portal.png")

        # 6. Sign out from NGO
        print("Signing out from NGO...")
        await page.click("text=Sign Out")
        await page.wait_for_selector("button:has-text('Log In')")
        await page.wait_for_timeout(500)

        # 7. Log in as Recycler (Green Earth Composters)
        print("Logging in as Recycler Green Earth Composters...")
        await page.click("button:has-text('Log In')")
        await page.wait_for_selector("text=Welcome back")
        await page.click("button:has-text('recycler')")
        await page.click("button:has-text('Green Earth Composters')")
        await page.click("button[type='submit']")
        await page.wait_for_selector("text=Bio-Recycler")
        await page.wait_for_timeout(1000)
        await page.screenshot(path="C:/Users/pvenk/.gemini/antigravity/brain/42ec04d9-63b0-4078-a67a-699b038bca61/auth_05_recycler_partner_portal.png")

        await browser.close()
        print("All auth verification screenshots successfully captured!")

asyncio.run(main())
