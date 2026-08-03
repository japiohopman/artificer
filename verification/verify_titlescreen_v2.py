import os
from playwright.sync_api import sync_playwright

def verify_title_screen():
    print("Starting Playwright verification...")
    with sync_playwright() as p:
        # Launch headless chromium
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 960})
        page = context.new_page()

        # Listen to console and errors
        page.on("console", lambda msg: print(f"BROWSER LOG: {msg.text}"))
        page.on("pageerror", lambda err: print(f"BROWSER ERROR: {err}"))

        # Navigate to the app on port 3000
        print("Navigating to http://localhost:3000...")
        page.goto("http://localhost:3000")

        # Wait for loading decryption to detach
        print("Waiting for save decryption loading overlay to disappear...")
        try:
            page.wait_for_selector("text=DECRYPTING SAVE DATA...", state="detached", timeout=30000)
        except Exception as e:
            print("Note: Decrypting Save Data loader not found or already detached.", e)

        # Wait for a slot or Create New Character button
        print("Waiting for Create New Character button...")
        try:
            page.wait_for_selector("text=Create New Character", timeout=15000)
            print("Create New Character button found!")
        except Exception as e:
            print("Error: Create New Character button not found.", e)

        # Take a full-page screenshot
        os.makedirs("verification", exist_ok=True)
        screenshot_path = "verification/titlescreen_v3_full.png"
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"Screenshot successfully captured and saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    verify_title_screen()
