import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Navigate to the app
        await page.goto("http://localhost:3000")
        await asyncio.sleep(3)

        # Click on character slot "MONIO"
        await page.click("text=MONIO")
        await asyncio.sleep(2)

        # Click "CONTINUE ADVENTURE"
        await page.click("text=CONTINUE ADVENTURE")
        await asyncio.sleep(5)

        # Look for input
        await page.wait_for_selector("input")
        # Ask DM to spawn a monster
        await page.fill("input", "I sense a goblin nearby... spawn one for me!")
        await page.keyboard.press("Enter")

        # Wait for AI tool call and spawn
        await asyncio.sleep(12)

        # Take a screenshot to see if a goblin is on the grid
        await page.screenshot(path="verification/data_driven_monster_spawn.png")
        print("Screenshot saved to verification/data_driven_monster_spawn.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
