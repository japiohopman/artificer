import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Navigate to app
        await page.goto("http://localhost:3000")
        await page.wait_for_selector("text=CREATE NEW CHARACTER", timeout=10000)

        # Set test step before mounting CharacterCreator
        await page.evaluate("window.__PLAYWRIGHT_TEST_STEP__ = 'species'")

        # Start character creator
        await page.click("text=CREATE NEW CHARACTER")
        await page.wait_for_timeout(1000)

        # Capture species step introduction
        await page.screenshot(path="/home/jules/verification/species_intro.png")
        print("Captured species_intro.png")

        # Click on Dwarf choice card
        dwarf_card = page.locator("button:has-text('Dwarf')").first
        if await dwarf_card.is_visible():
            await dwarf_card.click()
            await page.wait_for_timeout(1000)
            await page.screenshot(path="/home/jules/verification/species_selected.png")
            print("Captured species_selected.png")
        else:
            print("Dwarf card not visible!")

        await browser.close()

asyncio.run(run())
