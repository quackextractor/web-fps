Based on your game's documentation (INDUSTRIALIST - Descent Into Darkness) and the testing principles from your old assignment scans, I have designed 10 unmoderated test scenarios. 

Since your game bridges two distinct genres, I have adapted the variants to your game's specific modules:
*   **Variant A (5 Scenarios):** Focuses on the **FPS Action & Core Engine Mechanics** (Pathfinding, Ragdolls, Combat).
*   **Variant B (5 Scenarios):** Focuses on the **Tycoon/Economy & Meta-Progression** (Factory Hub, Armory, Authentication).

Because these must be completed without a moderator and from a completely fresh state (no preloading), the scenarios rely strictly on the default 500 credits, base weapons, and Level 1 access provided in your `initialSaveData`.

### Structure of the A4 Test Paper

To ensure the document looks professional and fits on a single A4 page per scenario, each sheet will have the following exact layout. The design eliminates the need for a moderator by speaking directly to the tester.

**[Header - Top 15% of page]**
*   **Company/Game Logo:** INDUSTRIALIST QA 
*   **Tester Name:** _______________   **Date:** _________   **Duration:** _____ min
*   **Scenario ID & Title:** (e.g., TS-A-01: First Blood & Loot Collection)
*   **Context:** A brief 2-sentence background of the scenario.

**[Instructions & Execution Table - Middle 50% of page]**
A clean table with three columns. Since there is no moderator, the tester reads the task, performs it, and records the result using the evaluation marks from your previous assignment: 
*(**✓** = Completed easily, **✗** = Failed/Incorrect, **~** = Completed with difficulty)*

| Step | Action to Perform | Expected Result | Status (✓ / ✗ / ~) |
| :--- | :--- | :--- | :--- |
| 1 | ... | ... | [   ] |

**[Results & Notes Space - Bottom 35% of page]**
A dedicated physical space for the tester to write qualitative feedback. It includes:
*   **Issue Log:** 4 wide, dotted lines specifically for explaining any step marked with a **✗** or **~**. 
*   **General Observations:** A rectangular bounded box (approx. 5cm high) for the tester to freely write down any UI confusion, visual glitches, or unexpected behaviors they encountered during the test.

*(Note: Per your instructions, the "Missing Functionality" and "Closing Questions" sections have been completely removed from this template).*

***

### Variant A: FPS Action & Core Engine Mechanics

**TS-A-01: First Blood & Loot Collection (Dynamic Drops)**
*   **Context:** Enemies drop vital resources for the factory upon death. We need to ensure the physics and pickup detection are intuitive.
*   **Step 1:** Click "Play" on the Main Menu and select "Level 1: Entry". 
*   **Step 2:** Navigate through the level using WASD and Mouse until you locate a brown enemy (Imp).
*   **Step 3:** Use the Pistol (Left Click) to defeat the Imp. *Expected:* The Imp dies and drops a Red Ore pickup exactly where it perished.
*   **Step 4:** Walk directly over the Red Ore. *Expected:* The ore disappears, and your HUD's loot counter updates to show 1 Red Ore.

**TS-A-02: A* Pathfinding & Corner Navigation**
*   **Context:** Enemies use A* pathfinding. We are testing if they can smoothly navigate sharp corners without clipping into walls.
*   **Step 1:** In Level 1, find an enemy and fire a shot to alert them, causing them to chase you.
*   **Step 2:** Retreat behind a sharp 90-degree wall corner and wait.
*   **Step 3:** Observe the enemy as it comes around the corner. *Expected:* The enemy should navigate the corner smoothly without getting permanently stuck on the wall geometry.

**TS-A-03: Settings Hydration & Persistence**
*   **Context:** Visual settings must apply immediately and persist without breaking the canvas rendering.
*   **Step 1:** From the Main Menu or Pause Menu, click Options -> Display.
*   **Step 2:** Change the Resolution to "320x240" and toggle "Scanlines" OFF.
*   **Step 3:** Click "Apply". *Expected:* The game's resolution instantly scales, and the CRT scanlines disappear.
*   **Step 4:** Refresh the browser page. *Expected:* The game boots up retaining the 320x240 resolution and disabled scanlines.

**TS-A-04: Ragdoll Physics & Death State**
*   **Context:** Testing the physics engine's handling of player death and enemy body parts.
*   **Step 1:** Start Level 1 and stand still, allowing an enemy to attack you until your health reaches 0.
*   **Step 2:** Observe the Death Screen. *Expected:* The screen transitions to a red-tinted death overlay. 
*   **Step 3:** Look at the enemy that killed you. *Expected:* If you managed to kill another enemy nearby before dying, their ragdolled body parts (head, torso, limbs) should remain physically scattered on the floor.
*   **Step 4:** Click "Restart". *Expected:* The level resets completely with your default health and ammo.

**TS-A-05: Weapon Switching & Auto-Fire Logic**
*   **Context:** Combat fluidity relies on seamless weapon swapping while engaging targets.
*   **Step 1:** Start a level. Press and hold Left Click (or Space) with the Pistol equipped.
*   **Step 2:** While holding the fire button, press the '1' key on your keyboard to switch to the Fist. *Expected:* The viewmodel swaps to the fist and immediately begins punching.
*   **Step 3:** While still holding the fire button, press '2' to swap back to the Pistol. *Expected:* The pistol equips and resumes firing without needing to release and re-click the mouse button.

***

### Variant B: Tycoon/Economy & Meta-Progression

**TS-B-01: Authentication & JWT Verification**
*   **Context:** Cloud saving requires a secure account. Testing the registration flow and visual feedback.
*   **Step 1:** From the Main Menu, click "Login".
*   **Step 2:** Enter a unique Username and Password, then click the Register/Login button.
*   **Step 3:** Observe the UI feedback. *Expected:* The system processes the registration securely, logs you in, and the cloud status indicator updates to show you are "synced".
*   **Step 4:** Return to the Main Menu. *Expected:* The "Login" button is replaced by your Username or a "Logout" option.

**TS-B-02: Factory Hub & Passive Income Generation**
*   **Context:** Testing the core Tycoon loop using the default starting capital of 500 credits.
*   **Step 1:** Click on "Factory Hub" from the Main Menu.
*   **Step 2:** Observe your starting balance. *Expected:* It should display exactly 500 Credits.
*   **Step 3:** Click on an "Empty Slot" and purchase a new Red Ore Factory for 200 credits.
*   **Step 4:** Wait and observe the new factory card. *Expected:* Your credits drop to 300, and the factory card shows a visual timer/progress bar indicating passive resource generation.

**TS-B-03: The Armory & Insufficient Funds Handling**
*   **Context:** Validating economy transaction security and UI error handling.
*   **Step 1:** Click on "Armory" from the Main Menu or Factory Hub.
*   **Step 2:** Locate the "Shotgun" recipe. Note that it costs 50 Bars and 2000 Credits.
*   **Step 3:** Click the "Buy/Unlock" button for the Shotgun. *Expected:* The transaction is blocked. A clear UI message (or toast notification) informs you that you have insufficient funds/bars.

**TS-B-04: Leaderboard API & Public Profile Fetching**
*   **Context:** The game allows you to view competitors' factories without exposing sensitive user data.
*   **Step 1:** From the Main Menu, navigate to the "Leaderboard".
*   **Step 2:** Wait for the list to populate and click on the top-ranking player's username.
*   **Step 3:** Observe the loaded profile. *Expected:* You are taken to a read-only view of that player's Factory Hub. You can see their machine layout, but all upgrade/collect buttons are disabled or hidden.

**TS-B-05: Destructive Action & Custom Modal (State Wipe)**
*   **Context:** Players must be protected from accidentally deleting their save, but the feature must work flawlessly when intended.
*   **Step 1:** Go to Options -> Data.
*   **Step 2:** Click the "Clear Progress" button.
*   **Step 3:** *Expected:* A custom, retro-styled confirmation modal appears on-screen (not a standard browser popup).
*   **Step 4:** Click "YES" to confirm. *Expected:* Your progress is wiped. Check the Level Select screen to verify that only Level 1 is available, and your credits are reset to the 500 default.