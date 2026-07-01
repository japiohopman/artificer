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

        # Take a screenshot to verify HUD is loaded
        await page.screenshot(path="verification/hud_loaded.png")

        # Try to find the ChatInput
        try:
            # Look for input
            await page.wait_for_selector("input", timeout=10000)
            await page.fill("input", "Hello Narrator, who am I?")
            await page.keyboard.press("Enter")

            # Wait for AI response
            await asyncio.sleep(10)

            # Take a final screenshot
            await page.screenshot(path="verification/ai_dm_final.png")
            print("Screenshot saved to verification/ai_dm_final.png")
        except Exception as e:
            print(f"Failed: {e}")
            await page.screenshot(path="verification/ai_dm_error.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
