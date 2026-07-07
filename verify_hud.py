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
        page.on("console", lambda msg: print(f"BROWSER: {msg.text}"))
        
        print("Navigating to http://localhost:3000")
        await page.goto('http://localhost:3000')
        
        # Wait for "MONIO" slot to be visible
        print("Waiting for MONIO slot...")
        monio_slot = await page.wait_for_selector("text=MONIO", timeout=30000)
        
        # Click the MONIO slot to select it
        print("Selecting MONIO slot...")
        await monio_slot.click()
        
        # Click "CONTINUE ADVENTURE"
        print("Waiting for CONTINUE ADVENTURE button to be enabled...")
        continue_btn_selector = 'button:has-text("CONTINUE ADVENTURE")'
        await page.wait_for_selector(f'{continue_btn_selector}:not([disabled])', timeout=10000)
        
        print("Clicking CONTINUE ADVENTURE...")
        await page.click(continue_btn_selector)
        
        # Wait for HUD
        print("Waiting for HUD (aside)...")
        try:
            # HUD components should appear
            await page.wait_for_selector('aside', timeout=20000)
            print("HUD loaded.")
            
            # Take screenshot of game hud
            os.makedirs('docs/screenshots', exist_ok=True)
            await page.screenshot(path='docs/screenshots/game_hud.png')
            print("Saved game_hud.png")
            
            # Switch to tactical view (Shift+G)
            print("Switching to Tactical view (Shift+G)...")
            await page.keyboard.down('Shift')
            await page.keyboard.press('g')
            await page.keyboard.up('Shift')
            
            # Wait for canvas to appear
            await page.wait_for_selector('canvas', timeout=10000)
            print("Tactical grid canvas loaded.")
            
            await page.screenshot(path='docs/screenshots/tactical_view.png')
            print("Saved tactical_view.png")
            
        except Exception as e:
            print(f"Error during HUD wait: {e}")
            await page.screenshot(path='docs/screenshots/error_state_hud.png')
            print("Saved error_state_hud.png for diagnosis.")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
