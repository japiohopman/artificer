from playwright.sync_api import sync_playwright, expect
import time

def verify_map(page):
    print("Navigating to http://localhost:3000...")
    page.goto("http://localhost:3000")

    # Wait for Landing Page
    page.wait_for_selector("text=THE ARCANE FORGE & DATABASE", timeout=30000)

    print("Selecting Slot 1...")
    page.click("text=MONIO") # Using specific text from screenshot

    print("Clicking Continue Adventure button...")
    page.click("button:has-text('Continue Adventure')")

    # Wait for map to load
    print("Waiting for leaflet container...")
    page.wait_for_selector(".leaflet-container", timeout=30000)

    # Open Atlas
    print("Opening Atlas (M shortcut)...")
    page.keyboard.press("m")

    time.sleep(2) # Wait for animation

    # Verify Legend is visible in ChatPanel
    print("Locate Party Button check...")
    expect(page.locator("button[title='Locate Party']")).to_be_visible()

    # Take screenshot of world map with legend
    page.screenshot(path="verification/map_with_atlas_and_legend.png")

    # Zoom in to check Miles scale and markers
    print("Zooming in...")
    for _ in range(3):
        page.click("button[title='Zoom In']")
        time.sleep(0.5)

    time.sleep(2)

    # Take screenshot of zoomed map
    page.screenshot(path="verification/map_zoomed.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set viewport to 1920x1080
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})
        try:
            verify_map(page)
        except Exception as e:
            print(f"Error during verification: {e}")
            page.screenshot(path="verification/error_verify.png")
        finally:
            browser.close()
