from playwright.sync_api import sync_playwright, expect
import time

def verify_audio_lab(page):
    # Wait for the dev server to be ready
    for _ in range(10):
        try:
            page.goto("http://localhost:3000")
            break
        except:
            time.sleep(2)
    
    # Wait for the Title Screen to load
    time.sleep(5)
    
    # Click "NEW GAME" to enter the game
    try:
        new_game_btn = page.get_by_role("button", name="NEW GAME")
        new_game_btn.click()
        print("Clicked NEW GAME")
    except Exception as e:
        print(f"Error clicking NEW GAME: {e}")
        return

    # Wait for the game HUD / Genesis Ritual to load
    time.sleep(10)
    
    # Open DevKit using the cog icon in the top left
    try:
        # Looking at debug_hud.png, there's a cog icon in the top left.
        # It's likely the devkit trigger.
        cog_btn = page.locator('button').filter(has=page.locator('svg')).first
        # Actually, let's try to be more precise. The top left button.
        cog_btn = page.locator('.fixed.top-4.left-4 button').first # Common pattern
        if cog_btn.count() == 0:
             cog_btn = page.locator('button').first # Just try the first button
             
        cog_btn.click()
        print("Clicked top-left button (assuming DevKit)")
    except Exception as e:
        print(f"Error clicking DevKit button: {e}")

    time.sleep(2)
    
    # Find and click the AUDIO_LAB tab
    try:
        # The DevKit header has several tabs.
        audio_lab_tab = page.get_by_role("button", name="AUDIO_LAB")
        if audio_lab_tab.count() == 0:
            # Try searching by text if role fails
            audio_lab_tab = page.locator('button:has-text("AUDIO_LAB")')
            
        audio_lab_tab.click()
        print("Clicked AUDIO_LAB tab")
    except Exception as e:
        print(f"Error clicking AUDIO_LAB tab: {e}")
        page.screenshot(path="verification/debug_devkit_open.png")
        return

    time.sleep(2)
    
    # Take screenshot of the Audio Laboratory
    page.screenshot(path="verification/audio_lab.png")
    print("Screenshot saved to verification/audio_lab.png")
    
    # Switch to REQUESTER tab
    try:
        requester_tab = page.get_by_role("button", name="REQUESTER")
        requester_tab.click()
        print("Clicked REQUESTER tab")
        time.sleep(1)
        page.screenshot(path="verification/audio_requester.png")
    except Exception as e:
        print(f"Error clicking REQUESTER tab: {e}")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})
        try:
            verify_audio_lab(page)
        finally:
            browser.close()
