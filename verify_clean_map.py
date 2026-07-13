import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080}
        )
        page = await context.new_page()
        
        print("Navigating to http://localhost:3000")
        await page.goto('http://localhost:3000')
        
        # Wait for "KOOP" slot to be visible
        print("Waiting for KOOP slot...")
        koop_slot = await page.wait_for_selector("text=KOOP", timeout=30000)
        
        # Click the KOOP slot to select it
        print("Selecting KOOP slot...")
        await koop_slot.click()
        
        # Click "CONTINUE ADVENTURE"
        print("Waiting for CONTINUE ADVENTURE button...")
        continue_btn_selector = 'button:has-text("CONTINUE ADVENTURE")'
        await page.wait_for_selector(continue_btn_selector, timeout=10000)
        
        print("Clicking CONTINUE ADVENTURE...")
        await page.click(continue_btn_selector)
        
        # Wait for HUD
        print("Waiting for HUD (aside)...")
        await page.wait_for_selector('aside', timeout=20000)
        print("HUD loaded.")
        
        # Wait a couple of seconds for animations and dynamic assets to load
        await asyncio.sleep(5)
        
        # Create verification directory and take a screenshot demonstrating the clean Map and WorldPanel with Legend
        os.makedirs('/home/jules/verification', exist_ok=True)
        await page.screenshot(path='/home/jules/verification/verification.png')
        print("Saved verification.png")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
