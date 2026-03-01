# Team TODO
> Critical = MVP, everything else is SHOULD HAVE.

### **Pavlo Kosov: Gameplay & Systems (FPS Engine)**
**Pending Tasks:**
- [ ] **HUD Minimap:** Move the minimap as is from the debug mode directly into the standard HUD.
- [ ] **Revenue Generation (CRITICAL):** Also straight up gain money by killing as well. This is needed for the upgrades to work.
- [ ] **Audio Feedback:** Add hitmark sound when player hits an enemy.
- [ ] **Dynamic Music System:** Add music placeholders (`start.mp3`, `loop.mp3`, `end.mp3`, `full.mp3`) and implement the music system. Use start/loop/end by default, and fallback to `full.mp3` with artificially looped short fades if not found.
- [ ] **Summary Screen:** Create a `PostRunSummary.tsx` screen displaying run totals and estimated dollar value.
- [ ] **Assets:** Create distinct 32x32 pixel art sprites for Red Ore and Green Ore pickups.
- [ ] **Risk Mechanic:** Modify the dead game state handler to halve run inventory values upon death.

### **Filip Houdek: Economy & State (Game Logic)**
**Pending Tasks:**
- [ ] **Smelting Core Logic (CRITICAL):** Add a way to smelt ore into bars (the definitive mechanism/functions to convert raw ore into processed bars within the context).
- [ ] **Offline Fallback:** Cache JSON state to `localStorage` and flag "Sync Error" if the POST request fails due to network errors.
- [ ] **Passive Processing:** Implement a `setInterval` hook (every 5s) inside `EconomyContext` to passively deduct ore and add bars if smelters are active.
- [ ] **Offline Progress Calculation:** Calculate time difference from `last_saved_at` timestamp and instantly award passively generated resources upon profile load.

### **Tobiáš Mrázek: Frontend Developer (Factory & Armory UI)**
**Pending Tasks:**
- [ ] **Session Management (CRITICAL):** Add a functional Logout button that clears the user session and returns to the login terminal.
- [ ] **Audio Options:** Add an SFX volume slider and a music volume slider to the options menu, and update the existing music tickbox to sync with them.
- [ ] **Changelog Page:** Add a Changelog route and page that automatically updates based on `CHANGELOG.md`. Add a Changelog button to the main menu and a "Back to Menu" button on the page.
- [ ] **Credits Page:** Add a Credits route and page. Add a Credits button to the main menu and a "Back to Menu" button on the page.
- [ ] **Visual Feedback:** Add CSS animations to `FactoryHub.tsx` (e.g., filling progress bar or spinning gear) when a smelter is active.

### **Dominik Hoch: Network & Backend Systems (Next.js APIs)**
**Pending Tasks:**
- [ ] Coordinate with the engineering team to implement necessary database modifications in accordance with new project specifications.

### **Slezák: Team Leader & Core Engine Dev**
**Pending Tasks:**
- [ ] **Game Rebranding:** Rename the game from *INFERNO*, *Inferno* to *INDUSTRIALIST*, *Industrialist* in all occurrences (README, layout, main menu, etc.).
- [ ] **Analytics Integration:** Add Vercel analytics based on `https://vercel.com/quackextractors-projects/web-fps/analytics?source=prod-checklist&environment=all`.