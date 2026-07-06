from playwright.sync_api import sync_playwright
import time

def generate_screenshots():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        print("Navigating to Artificer...")
        try:
            page.goto("http://localhost:3000", timeout=60000)

            # Wait for slots
            page.wait_for_selector("text=MONIO", timeout=20000)

            # Select MONIO
            print("Selecting MONIO...")
            page.click("text=MONIO")
            time.sleep(2)

            # Click Continue Adventure
            print("Clicking Continue Adventure...")
            # Click by finding the button element that contains the text
            page.click("button:has-text('CONTINUE ADVENTURE')")

            # Wait for the loading screen to disappear and main UI to show
            print("Waiting for main UI...")
            # Increased timeout and checking for common UI elements
            page.wait_for_selector("button[title='Atlas'], .fantasy-atlas-frame", timeout=90000)
            print("Main UI detected!")
            time.sleep(10) # Heavy buffer for all map tiles

            # 1. Wide Map
            page.screenshot(path="verification/promo_world_map_wide.png")

            # 2. World Panel
            print("Capturing World Panel...")
            page.click("button[title='Atlas']")
            time.sleep(3)
            page.screenshot(path="verification/promo_world_panel.png")

            # 3. Character Profile
            print("Capturing Character Profile...")
            # Use keyboard shortcut
            page.keyboard.press("i")
            time.sleep(5)
            page.screenshot(path="verification/promo_character_profile.png")
            page.keyboard.press("Escape")
            time.sleep(2)

            # 4. Zoomed + Legend
            print("Capturing Zoomed + Legend...")
            # Re-open if Atlas closed it? No, Atlas is a sidebar.
            for _ in range(4):
                page.click("button[title='Zoom In']")
                time.sleep(0.5)

            page.click("button[title='Toggle Map Legend']")
            time.sleep(3)
            page.screenshot(path="verification/promo_map_zoomed_legend.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_debug_final.png")
        finally:
            browser.close()

if __name__ == "__main__":
    generate_screenshots()
