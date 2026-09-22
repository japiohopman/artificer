import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Navigate to the app
        await page.goto("http://localhost:3000")

        # Try to find any button that might be "Combat Tester" or just wait for CombatGrid
        await asyncio.sleep(5)

        # Take a screenshot regardless
        await page.screenshot(path="verification/combat_grid_final.png")
        print("Screenshot saved to verification/combat_grid_final.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
