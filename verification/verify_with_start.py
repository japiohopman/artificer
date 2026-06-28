from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})
        
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        
        print("Navigating...")
        page.goto("http://localhost:3000")
        time.sleep(5)
        
        # Click "New Game" button
        print("Clicking New Game...")
        # Try different ways to find the button
        try:
            page.get_by_role("button", name="New Game").click(timeout=5000)
        except:
            try:
                page.get_by_text("New Game").click(timeout=5000)
            except:
                # Fallback: click anywhere to start music/interaction then try again
                page.mouse.click(960, 540)
                time.sleep(1)
                page.get_by_text("New Game").click()
            
        time.sleep(15)
        
        # Check for markers
        marker_count = page.locator('.leaflet-marker-icon').count()
        print(f"Markers found: {marker_count}")
        
        page.screenshot(path="verification/final_markers_check.png")
        
        # If markers are found, click one
        if marker_count > 0:
            print("Clicking a marker...")
            page.locator('.leaflet-marker-icon').nth(marker_count // 2).click(force=True)
            time.sleep(2)
            page.screenshot(path="verification/final_inspected_check.png")
            
        browser.close()

if __name__ == "__main__":
    run()
