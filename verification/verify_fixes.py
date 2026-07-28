import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        # Launch browser headless
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Set viewport to standard high resolution
        await page.set_viewport_size({"width": 1440, "height": 900})

        # Navigate to application
        print("Navigating to application...")
        await page.goto("http://localhost:3000")

        # Wait for useUIStore and useGameStore to be bound on window
        print("Waiting for stores to be loaded...")
        await page.wait_for_function("() => window.useUIStore !== undefined && window.useGameStore !== undefined", timeout=45000)

        # Force state to bypass title screen and open DevKit
        print("Bypassing title screen and opening DevKit...")
        await page.evaluate("""() => {
            window.useGameStore.setState({ isGameStarted: true });
            window.useUIStore.setState({
                isCharacterCreatorOpen: false,
                isLoading: false,
                isDevKitOpen: true,
                isExplorerOpen: true
            });
        }""")
        await page.wait_for_timeout(4000)

        # Take screenshot of the screen state
        print("Capturing debug_state.png...")
        os.makedirs("verification", exist_ok=True)
        await page.screenshot(path="verification/debug_state.png")

        await browser.close()
        print("Verification completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
