from playwright.sync_api import sync_playwright
import time
import os

def generate_screenshots():
    # Ensure target directory exists
    target_dir = "docs/screenshots"
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a taller viewport to ensure the full profile is captured
        context = browser.new_context(viewport={'width': 1920, 'height': 2000})
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
            page.click("button:has-text('CONTINUE ADVENTURE')")

            # Wait for the loading screen to disappear and main UI to show
            print("Waiting for main UI...")
            page.wait_for_selector("button[title='Atlas'], .fantasy-atlas-frame", timeout=90000)
            print("Main UI detected!")
            time.sleep(10) # Heavy buffer for all map tiles

            # 1. Wide Map with Side Panels
            print("Capturing Map with Side Panels...")
            # Open Atlas (Left Panel)
            page.click("button[title='Atlas']")
            # Open Hero (Right Panel)
            page.click("button[title='Hero']")
            time.sleep(5)
            page.screenshot(path=f"{target_dir}/promo_world_map_with_panels.png")

            # 2. Character Profile Full (Modal)
            print("Capturing Character Profile...")
            page.keyboard.press("i")
            time.sleep(5)
            # Take a screenshot of the whole page (modal should be centered)
            page.screenshot(path=f"{target_dir}/promo_character_profile_full.png", full_page=True)
            # Explicitly close with Escape
            page.keyboard.press("Escape")
            time.sleep(2)

            # 3. Journal
            print("Capturing Journal...")
            page.keyboard.press("Alt+j")
            time.sleep(3)
            page.screenshot(path=f"{target_dir}/promo_journal.png")
            # Explicitly close with Escape
            page.keyboard.press("Escape")
            time.sleep(2)

            # 4. Dice Roller
            print("Capturing Dice Roller...")
            # We need to ensure chat is expanded or at least not blocked
            # Using force=True if it's intercepted, though it shouldn't be if Journal is closed
            page.click("button[title='Toggle Advanced Roller']", force=True)
            time.sleep(3)
            page.screenshot(path=f"{target_dir}/promo_dice_roller.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path=f"{target_dir}/error_debug_final.png")
        finally:
            browser.close()

if __name__ == "__main__":
    generate_screenshots()
