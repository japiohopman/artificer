# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/verify_character_creator_flow.spec.ts >> verify complete guided character creator flow, validation overlay, and review state
- Location: tests/verify_character_creator_flow.spec.ts:3:1

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('div').filter({ hasText: /Acolyte/i }).first()

```

# Page snapshot

```yaml
- generic [ref=e5]:
  - generic [ref=e6]:
    - generic:
      - heading "Class" [level=1]
  - generic [ref=e12]:
    - generic [ref=e13]:
      - button "Welcome" [ref=e14]
      - button "Save Slot" [ref=e18]
      - button "Identity" [ref=e22]
      - button "Species" [ref=e26]
      - button "Class" [ref=e30]
      - button "Origins" [disabled]
      - button "Alignment" [disabled]
      - button "Attributes" [disabled]
      - button "Skills & Choices" [disabled]
      - button "Gear" [disabled]
      - button "Appearance" [disabled]
      - button "Describe Your Character" [disabled]
      - button "Commit" [disabled]
    - generic [ref=e38]:
      - generic [ref=e39]:
        - button "barbarian barbarian Choose" [ref=e40] [cursor=pointer]:
          - generic [ref=e42]:
            - generic "barbarian"
          - generic [ref=e43]:
            - generic [ref=e44]: barbarian
            - generic [ref=e45]: Choose
        - button "bard bard Choose" [ref=e46] [cursor=pointer]:
          - generic [ref=e48]:
            - generic "bard"
          - generic [ref=e49]:
            - generic [ref=e50]: bard
            - generic [ref=e51]: Choose
        - button "cleric cleric Choose" [ref=e52] [cursor=pointer]:
          - generic [ref=e54]:
            - generic "cleric"
          - generic [ref=e55]:
            - generic [ref=e56]: cleric
            - generic [ref=e57]: Choose
        - button "druid druid Choose" [ref=e58] [cursor=pointer]:
          - generic [ref=e60]:
            - generic "druid"
          - generic [ref=e61]:
            - generic [ref=e62]: druid
            - generic [ref=e63]: Choose
        - button "fighter fighter Choose" [ref=e64] [cursor=pointer]:
          - generic [ref=e66]:
            - generic "fighter"
          - generic [ref=e67]:
            - generic [ref=e68]: fighter
            - generic [ref=e69]: Choose
        - button "monk monk Choose" [ref=e70] [cursor=pointer]:
          - generic [ref=e72]:
            - generic "monk"
          - generic [ref=e73]:
            - generic [ref=e74]: monk
            - generic [ref=e75]: Choose
        - button "paladin paladin Choose" [ref=e76] [cursor=pointer]:
          - generic [ref=e78]:
            - generic "paladin"
          - generic [ref=e79]:
            - generic [ref=e80]: paladin
            - generic [ref=e81]: Choose
        - button "ranger ranger Choose" [ref=e82] [cursor=pointer]:
          - generic [ref=e84]:
            - generic "ranger"
          - generic [ref=e85]:
            - generic [ref=e86]: ranger
            - generic [ref=e87]: Choose
        - button "rogue rogue Choose" [ref=e88] [cursor=pointer]:
          - generic [ref=e90]:
            - generic "rogue"
          - generic [ref=e91]:
            - generic [ref=e92]: rogue
            - generic [ref=e93]: Choose
        - button "sorcerer sorcerer Choose" [ref=e94] [cursor=pointer]:
          - generic [ref=e96]:
            - generic "sorcerer"
          - generic [ref=e97]:
            - generic [ref=e98]: sorcerer
            - generic [ref=e99]: Choose
        - button "warlock warlock Choose" [ref=e100] [cursor=pointer]:
          - generic [ref=e102]:
            - generic "warlock"
          - generic [ref=e103]:
            - generic [ref=e104]: warlock
            - generic [ref=e105]: Choose
        - button "wizard wizard Choose" [ref=e106] [cursor=pointer]:
          - generic [ref=e108]:
            - generic "wizard"
          - generic [ref=e109]:
            - generic [ref=e110]: wizard
            - generic [ref=e111]: Choose
      - generic [ref=e112]:
        - generic [ref=e113]:
          - generic [ref=e114]: Choose Class
          - button "Help [?]" [ref=e117]
        - generic [ref=e122]:
          - heading "Choosing Your Class" [level=1] [ref=e123]
          - paragraph [ref=e124]:
            - text: Every adventurer has a
            - strong [ref=e125]: class
            - text: . Your class describes your character's vocation, training, and the special talents they have developed. It shapes the way they approach danger, the tactics they favor, and the role they play when exploring ancient ruins, fighting monsters, or navigating a tense negotiation.
          - paragraph [ref=e126]:
            - text: Where your species tells the story of
            - strong [ref=e127]: where you come from
            - text: ", your class begins to define"
            - strong [ref=e128]: what you have learned to do
            - text: .
          - paragraph [ref=e129]: Will you stand on the front line as a mighty warrior? Master the arcane arts as a wizard? Walk unseen through the shadows as a rogue? Or call upon divine power as a cleric?
          - paragraph [ref=e130]: The choice is yours.
          - heading "What Your Class Gives You" [level=2] [ref=e133]
          - paragraph [ref=e134]: Your class provides many of the abilities and proficiencies that define your character throughout their adventuring career.
          - heading "Class Features" [level=3] [ref=e135]
          - paragraph [ref=e136]:
            - text: Your class grants you unique
            - strong [ref=e137]: class features
            - text: —special capabilities that distinguish you from members of other classes.
          - paragraph [ref=e138]:
            - text: These may include powerful combat abilities, extraordinary talents, or the ability to
            - strong [ref=e139]: cast spells
            - text: and wield magic.
          - paragraph [ref=e140]: As you gain levels, your class continues to unlock new abilities and opportunities, allowing your character to grow from an inexperienced adventurer into a seasoned hero.
          - heading "Proficiencies" [level=3] [ref=e141]
          - paragraph [ref=e142]:
            - text: Your class also grants various
            - strong [ref=e143]: proficiencies
            - text: ", representing the skills and training your character has acquired."
          - paragraph [ref=e144]: "These may include:"
          - list [ref=e145]:
            - listitem [ref=e146]:
              - strong [ref=e147]: Armor
              - text: — the protection you know how to wear and use effectively.
            - listitem [ref=e148]:
              - strong [ref=e149]: Weapons
              - text: — the weapons you have been trained to wield.
            - listitem [ref=e150]:
              - strong [ref=e151]: Skills
              - text: — areas of expertise that come naturally through your training.
            - listitem [ref=e152]:
              - strong [ref=e153]: Saving Throws
              - text: — abilities you rely upon when resisting dangerous effects.
            - listitem [ref=e154]:
              - strong [ref=e155]: Tools
              - text: — specialized equipment with which you have learned to work.
          - paragraph [ref=e156]: Your proficiencies define many of the things your character can do particularly well—from striking with a trusted weapon to tracking a creature through the wilderness or telling a convincing lie.
          - paragraph [ref=e157]:
            - text: Record all the features and proficiencies your class grants you at
            - strong [ref=e158]: 1st level
            - text: on your character sheet.
          - heading "Your First Level" [level=1] [ref=e161]
          - paragraph [ref=e162]:
            - text: Most characters begin their adventuring career at
            - strong [ref=e163]: 1st level
            - text: .
          - paragraph [ref=e164]: At this stage, your character may be inexperienced in the world of adventuring, even if they have already lived a dangerous life. A former soldier, sailor, criminal, or hunter may have faced plenty of danger before—but becoming an adventurer marks the beginning of something new.
          - paragraph [ref=e165]:
            - strong [ref=e166]: 1st level is where your story begins.
          - paragraph [ref=e167]:
            - text: As you adventure, overcome challenges, and survive encounters, you gain
            - strong [ref=e168]: experience points (XP)
            - text: and advance in level.
          - paragraph [ref=e169]: "Each new level represents growth: greater skill, deeper knowledge, stronger abilities, and new challenges worthy of a more experienced hero."
          - paragraph [ref=e170]: If you are joining an existing campaign, or already know the game well, your Dungeon Master may choose to begin your character at a higher level. In that case, your character has already survived adventures that would test an inexperienced hero.
          - paragraph [ref=e171]:
            - text: Record your
            - strong [ref=e172]: level
            - text: and
            - strong [ref=e173]: experience points
            - text: on your character sheet.
          - paragraph [ref=e174]:
            - text: A 1st-level character begins with
            - strong [ref=e175]: 0 XP
            - text: . Characters beginning at higher levels typically start with the minimum XP required to reach that level.
          - heading "Hit Points & Hit Dice" [level=1] [ref=e178]
          - paragraph [ref=e179]: Adventuring is dangerous.
          - paragraph [ref=e180]:
            - text: Your
            - strong [ref=e181]: hit points (HP)
            - text: represent how much punishment your character can withstand before falling in battle or becoming unable to continue.
          - paragraph [ref=e182]:
            - text: Your hit points are determined by your
            - strong [ref=e183]: Hit Dice
            - text: —short for
            - emphasis [ref=e184]: Hit Point Dice
            - text: —which are tied to your class.
          - paragraph [ref=e185]: A sturdy warrior may be able to withstand blows that would bring down a fragile spellcaster, while a nimble rogue may rely on speed and cunning to avoid taking those blows in the first place.
          - paragraph [ref=e186]: Your Hit Dice are therefore more than another number on your character sheet.
          - paragraph [ref=e187]:
            - text: They are part of what determines
            - strong [ref=e188]: how you survive when the adventure turns deadly
            - text: .
          - heading "Choose Your Path" [level=3] [ref=e191]
          - paragraph [ref=e192]:
            - text: Select a class from the records on the left to discover its
            - strong [ref=e193]: abilities, proficiencies, starting features, and role in the world
            - text: .
          - paragraph [ref=e194]: Your species tells us where you came from.
          - paragraph [ref=e195]:
            - strong [ref=e196]: Your class tells us what you have learned to become.
          - paragraph [ref=e197]: Now the adventure can truly begin.
    - generic [ref=e199]:
      - generic [ref=e200]:
        - generic [ref=e201]:
          - generic [ref=e202]: Manifest Frame
          - generic [ref=e203]: D&D 5e (2014)
        - heading "Unmanifested Hero" [level=2] [ref=e204]
      - generic [ref=e208]:
        - generic [ref=e209]:
          - generic [ref=e210]:
            - generic [ref=e211]:
              - heading "Unmanifested Hero" [level=2] [ref=e212]
              - paragraph [ref=e213]: Adventurer • human • Lvl 1
            - generic [ref=e217]:
              - generic [ref=e218]: — / —
              - generic [ref=e219]: Hit Points
          - generic [ref=e222]:
            - button "Stats" [ref=e223] [cursor=pointer]
            - button "Traits" [ref=e227] [cursor=pointer]
            - button "Gear" [ref=e232] [cursor=pointer]
            - button "Spells" [ref=e237] [cursor=pointer]
            - button "Bio" [ref=e241] [cursor=pointer]
        - generic [ref=e248]:
          - heading "Mechanical Traits & Proficiencies" [level=3] [ref=e253]
          - generic [ref=e254]:
            - generic [ref=e255]: Languages
            - generic [ref=e260]: common
  - generic [ref=e263]:
    - generic [ref=e268]:
      - heading "Complete Your Character" [level=3] [ref=e269]
      - paragraph [ref=e270]: Required character choices are missing before manifestation.
    - generic [ref=e271]:
      - generic [ref=e272]:
        - generic [ref=e275]:
          - generic [ref=e276]: Soul Moniker
          - generic [ref=e277]: Character name is missing
        - button "Jump" [ref=e278]
      - generic [ref=e279]:
        - generic [ref=e285]:
          - generic [ref=e286]: Class
          - generic [ref=e287]: No class selected
        - button "Jump" [ref=e288]
      - generic [ref=e289]:
        - generic [ref=e292]:
          - generic [ref=e293]: Origins / Background
          - generic [ref=e294]: No background selected
        - button "Jump" [ref=e295]
      - generic [ref=e296]:
        - generic [ref=e301]:
          - generic [ref=e302]: Alignment
          - generic [ref=e303]: No alignment selected
        - button "Jump" [ref=e304]
    - button "Dismiss" [ref=e306]
  - generic [ref=e307]:
    - button "Previous" [ref=e308]
    - generic [ref=e309]:
      - generic [ref=e310]: Character Creation Wizard
      - generic [ref=e311]: Step 5 of 13
    - button "Continue" [active] [ref=e313] [cursor=pointer]
```

# Test source

```ts
  12  |     await page.evaluate(() => {
  13  |       if ((window as any).useGameStore) {
  14  |         (window as any).useGameStore.setState({ isGameStarted: true });
  15  |       }
  16  |       if ((window as any).useUIStore) {
  17  |         (window as any).useUIStore.setState({ isCharacterCreatorOpen: true, isLoading: false });
  18  |       }
  19  |     });
  20  |
  21  |     await page.waitForTimeout(1000);
  22  |
  23  |     // 1. Welcome Step & Ruleset Selection
  24  |     console.log('1. Verifying Welcome Step & Ruleset Context...');
  25  |     await expect(page.locator('text=Welcome to Character Creation')).toBeVisible();
  26  |     await expect(page.locator('button:has-text("D&D 5e (2014)")')).toBeVisible();
  27  |     await expect(page.locator('button:has-text("D&D 5.5e (2024)")')).toBeVisible();
  28  |
  29  |     // Select 2014 ruleset so canGoNext() returns true
  30  |     await page.click('button:has-text("D&D 5e (2014)")');
  31  |     await page.waitForTimeout(300);
  32  |
  33  |     // Click Continue to go to Save Slot step
  34  |     await page.click('#next-stage-btn');
  35  |     await page.waitForTimeout(500);
  36  |
  37  |     // 2. Save Slot Step & Validation Overlay Test
  38  |     console.log('2. Verifying Save Slot & Validation Overlay...');
  39  |     await expect(page.locator('h2:has-text("Select Save Manifest")')).toBeVisible();
  40  |
  41  |     // Try to continue without selecting a save slot -> trigger validation overlay
  42  |     console.log('Testing Validation Overlay trigger on incomplete step...');
  43  |     await page.click('#next-stage-btn');
  44  |     await page.waitForTimeout(500);
  45  |
  46  |     // Expect Validation Overlay modal to pop up
  47  |     await expect(page.locator('text=Complete Your Character')).toBeVisible();
  48  |     await expect(page.locator('text=No save slot selected')).toBeVisible();
  49  |
  50  |     // Dismiss validation overlay
  51  |     await page.click('button:has-text("Dismiss")');
  52  |     await page.waitForTimeout(300);
  53  |
  54  |     // Select Slot 1
  55  |     console.log('Selecting Slot 1...');
  56  |     await page.click('button:has-text("Slot_01")');
  57  |     await page.waitForTimeout(300);
  58  |
  59  |     // Continue to Identity step
  60  |     await page.click('#next-stage-btn');
  61  |     await page.waitForTimeout(500);
  62  |
  63  |     // 3. Identity Step & Gender Selection
  64  |     console.log('3. Verifying Identity Step & Gender Selection...');
  65  |     await expect(page.locator('h2:has-text("Manifested Polarity")')).toBeVisible();
  66  |
  67  |     // Try to continue without selecting gender -> trigger validation overlay
  68  |     await page.click('#next-stage-btn');
  69  |     await page.waitForTimeout(500);
  70  |
  71  |     await expect(page.locator('text=Complete Your Character')).toBeVisible();
  72  |
  73  |     // Dismiss validation overlay
  74  |     await page.click('button:has-text("Dismiss")');
  75  |     await page.waitForTimeout(300);
  76  |
  77  |     // Select Male polarity by clicking the GenderBodySvg element
  78  |     await page.locator('div:has-text("Male")').last().click();
  79  |     await page.waitForTimeout(300);
  80  |
  81  |     await page.click('#next-stage-btn');
  82  |     await page.waitForTimeout(500);
  83  |
  84  |     // 4. Species Step
  85  |     console.log('4. Verifying Species Step & 3:2 Aspect Ratio Cards...');
  86  |     await expect(page.locator('text=Select Species & Heritage')).toBeVisible();
  87  |     await expect(page.locator('button').filter({ hasText: /^Human/ })).toBeVisible();
  88  |
  89  |     // Select Human
  90  |     await page.locator('button').filter({ hasText: /^Human/ }).click();
  91  |     await page.waitForTimeout(500);
  92  |     await expect(page.locator('text=Examine Records: Human')).toBeVisible();
  93  |
  94  |     await page.click('#next-stage-btn');
  95  |     await page.waitForTimeout(500);
  96  |
  97  |     // 5. Class Step
  98  |     console.log('5. Verifying Class Step & 2:3 Aspect Ratio Cards...');
  99  |     await expect(page.locator('text=Choose Class')).toBeVisible();
  100 |     await expect(page.locator('div').filter({ hasText: /Fighter/i }).first()).toBeVisible();
  101 |
  102 |     // Select Fighter
  103 |     await page.locator('div').filter({ hasText: /Fighter/i }).first().click();
  104 |     await page.waitForTimeout(500);
  105 |
  106 |     await page.click('#next-stage-btn');
  107 |     await page.waitForTimeout(500);
  108 |
  109 |     // 6. Background Step (Origins)
  110 |     console.log('6. Verifying Background Step & 1:1 Aspect Ratio Cards...');
  111 |     await page.waitForTimeout(500);
> 112 |     await page.locator('div').filter({ hasText: /Acolyte/i }).first().click();
      |                                                                       ^ Error: locator.click: Test timeout of 60000ms exceeded.
  113 |     await page.waitForTimeout(500);
  114 |
  115 |     await page.click('#next-stage-btn');
  116 |     await page.waitForTimeout(500);
  117 |
  118 |     // 7. Alignment Step
  119 |     console.log('7. Verifying Alignment Step...');
  120 |     await expect(page.locator('button').filter({ hasText: /^Lawful Good/ })).toBeVisible();
  121 |
  122 |     // Select Lawful Good
  123 |     await page.locator('button').filter({ hasText: /^Lawful Good/ }).click();
  124 |     await page.waitForTimeout(500);
  125 |
  126 |     await page.click('#next-stage-btn');
  127 |     await page.waitForTimeout(500);
  128 |
  129 |     // 8. Attributes Step
  130 |     console.log('8. Verifying Attributes Step...');
  131 |     await page.click('#next-stage-btn');
  132 |     await page.waitForTimeout(500);
  133 |
  134 |     // 9. Choices Step
  135 |     console.log('9. Verifying Choices Step...');
  136 |     await page.click('#next-stage-btn');
  137 |     await page.waitForTimeout(500);
  138 |
  139 |     // 10. Equipment Step
  140 |     console.log('10. Verifying Equipment Step...');
  141 |     await page.click('#next-stage-btn');
  142 |     await page.waitForTimeout(500);
  143 |
  144 |     // 11. Appearance Step
  145 |     console.log('11. Verifying Appearance Step...');
  146 |     await page.click('#next-stage-btn');
  147 |     await page.waitForTimeout(500);
  148 |
  149 |     // 12. Describe Your Character Step
  150 |     console.log('12. Verifying Backstory Step...');
  151 |     await page.click('#next-stage-btn');
  152 |     await page.waitForTimeout(500);
  153 |
  154 |     // 13. Review Step (Final Manifest)
  155 |     console.log('13. Verifying Review Step (Final Manifest)...');
  156 |     await expect(page.locator('h2:has-text("Final Manifest")')).toBeVisible();
  157 |     await expect(page.getByText('Arthur')).toBeVisible();
  158 |     await expect(page.getByText('Level 0 fighter')).toBeVisible();
  159 |     await expect(page.locator('#review-ruleset-badge')).toContainText('Ruleset: D&D 5e (2014)');
  160 |
  161 |     // Save screenshot
  162 |     await page.screenshot({ path: 'verification/character_creator_guided_review.png' });
  163 |     console.log('✓ Playwright guided character creator flow test complete!');
  164 | });
  165 |
```