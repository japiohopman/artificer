import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a taller viewport to capture the buttons below the fold
        context = browser.new_context(viewport={"width": 1280, "height": 1000})
        page = context.new_page()

        print("Navigating to Title Screen at http://localhost:3000...")
        page.goto("http://localhost:3000")

        print("Waiting for save manifests to load...")
        time.sleep(5)

        screenshot_path = "verification/titlescreen_full.png"
        page.screenshot(path=screenshot_path)
        print(f"Full height screenshot successfully captured and saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    run()
