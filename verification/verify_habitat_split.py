import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1600, "height": 900})

        print("Navigating to application...")
        await page.goto("http://localhost:3000")

        print("Waiting for stores...")
        await page.wait_for_function("() => window.useUIStore !== undefined && window.useGameStore !== undefined", timeout=45000)

        print("Bypassing title screen and opening DevKit...")
        await page.evaluate("""() => {
            window.useGameStore.setState({ isGameStarted: true });
            window.useUIStore.setState({
                isCharacterCreatorOpen: false,
                isLoading: false,
                isDevKitOpen: true
            });
        }""")
        await page.wait_for_timeout(2000)

        print("Clicking GENERATORS tab...")
        await page.click("button:has-text('GENERATORS')")
        await page.wait_for_timeout(1000)

        print("Clicking HABITAT generator sub-tab...")
        await page.click("button:has-text('HABITAT')")
        await page.wait_for_timeout(2000)

        print("Capturing habitat_split_layout.png...")
        os.makedirs("verification", exist_ok=True)
        await page.screenshot(path="verification/habitat_split_layout.png")

        await browser.close()
        print("Done!")

if __name__ == "__main__":
    asyncio.run(main())
