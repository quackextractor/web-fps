export type StepStatus = "✓" | "✗" | "~" | "";

export interface TestStep {
  number: number;
  action: string;
  expected: string;
}

export interface TestScenario {
  id: string;
  title: string;
  variant: "A" | "B";
  context: string;
  steps: TestStep[];
}

export const QA_SCENARIOS: TestScenario[] = [
  {
    id: "TS-A-01",
    title: "First Blood & Loot Collection",
    variant: "A",
    context: "Enemies drop vital resources for the factory upon death. We need to ensure the physics and pickup detection are intuitive.",
    steps: [
      { number: 1, action: "Click 'Play' on the Main Menu and select 'Level 1: Entry'.", expected: "Level loads." },
      { number: 2, action: "Navigate through the level using WASD and Mouse until you locate a brown enemy (Imp).", expected: "Imp is located." },
      { number: 3, action: "Use the Pistol (Left Click) to defeat the Imp.", expected: "The Imp dies and drops a Red Ore pickup exactly where it perished." },
      { number: 4, action: "Walk directly over the Red Ore.", expected: "The ore disappears, and your HUD's loot counter updates to show 1 Red Ore." }
    ]
  },
  {
    id: "TS-A-02",
    title: "Pathfinding & Corner Navigation",
    variant: "A",
    context: "Enemies use A* pathfinding. We are testing if they can smoothly navigate sharp corners without clipping into walls.",
    steps: [
      { number: 1, action: "In Level 1, find an enemy and fire a shot to alert them, causing them to chase you.", expected: "Enemy begins chasing." },
      { number: 2, action: "Retreat behind a sharp 90-degree wall corner and wait.", expected: "You are positioned behind cover." },
      { number: 3, action: "Observe the enemy as it comes around the corner.", expected: "The enemy should navigate the corner smoothly without getting permanently stuck on the wall geometry." }
    ]
  },
  {
    id: "TS-A-03",
    title: "Settings Hydration & Persistence",
    variant: "A",
    context: "Visual settings must apply immediately and persist without breaking the canvas rendering.",
    steps: [
      { number: 1, action: "From the Main Menu or Pause Menu, click Options -> Display.", expected: "Options menu opens." },
      { number: 2, action: "Change the Resolution to '320x240' and toggle 'Scanlines' OFF.", expected: "Settings are modified." },
      { number: 3, action: "Click 'Apply'.", expected: "The game's resolution instantly scales, and the CRT scanlines disappear." },
      { number: 4, action: "Refresh the browser page.", expected: "The game boots up retaining the 320x240 resolution and disabled scanlines." }
    ]
  },
  {
    id: "TS-A-04",
    title: "Ragdoll Physics & Death State",
    variant: "A",
    context: "Testing the physics engine's handling of player death and enemy body parts.",
    steps: [
      { number: 1, action: "Start Level 1 and stand still, allowing an enemy to attack you until your health reaches 0.", expected: "Player dies." },
      { number: 2, action: "Observe the Death Screen.", expected: "The screen transitions to a red-tinted death overlay." },
      { number: 3, action: "Look at the enemy that killed you.", expected: "If you managed to kill another enemy nearby before dying, their ragdolled body parts should remain physically scattered on the floor." },
      { number: 4, action: "Click 'Restart'.", expected: "The level resets completely with your default health and ammo." }
    ]
  },
  {
    id: "TS-A-05",
    title: "Weapon Switching & Auto-Fire Logic",
    variant: "A",
    context: "Combat fluidity relies on seamless weapon swapping while engaging targets.",
    steps: [
      { number: 1, action: "Start a level. Press and hold Left Click (or Space) with the Pistol equipped.", expected: "Pistol fires." },
      { number: 2, action: "While holding the fire button, press the '1' key on your keyboard to switch to the Fist.", expected: "The viewmodel swaps to the fist and immediately begins punching." },
      { number: 3, action: "While still holding the fire button, press '2' to swap back to the Pistol.", expected: "The pistol equips and resumes firing without needing to release and re-click the mouse button." }
    ]
  },
  {
    id: "TS-B-01",
    title: "Authentication & JWT Verification",
    variant: "B",
    context: "Cloud saving requires a secure account. Testing the registration flow and visual feedback.",
    steps: [
      { number: 1, action: "From the Main Menu, click 'Login'.", expected: "Login screen appears." },
      { number: 2, action: "Enter a unique Username and Password, then click the Register/Login button.", expected: "Credentials entered." },
      { number: 3, action: "Observe the UI feedback.", expected: "The system processes the registration securely, logs you in, and the cloud status indicator updates to show you are 'synced'." },
      { number: 4, action: "Return to the Main Menu.", expected: "The 'Login' button is replaced by your Username or a 'Logout' option." }
    ]
  },
  {
    id: "TS-B-02",
    title: "Factory Hub & Passive Income Generation",
    variant: "B",
    context: "Testing the core Tycoon loop using the default starting capital of 500 credits.",
    steps: [
      { number: 1, action: "Click on 'Factory Hub' from the Main Menu.", expected: "Factory Hub opens." },
      { number: 2, action: "Observe your starting balance.", expected: "It should display exactly 500 Credits." },
      { number: 3, action: "Click on an 'Empty Slot' and purchase a new Red Ore Factory for 200 credits.", expected: "Factory purchased." },
      { number: 4, action: "Wait and observe the new factory card.", expected: "Your credits drop to 300, and the factory card shows a visual timer/progress bar indicating passive resource generation." }
    ]
  },
  {
    id: "TS-B-03",
    title: "The Armory & Insufficient Funds Handling",
    variant: "B",
    context: "Validating economy transaction security and UI error handling.",
    steps: [
      { number: 1, action: "Click on 'Armory' from the Main Menu or Factory Hub.", expected: "Armory opens." },
      { number: 2, action: "Locate the 'Shotgun' recipe. Note that it costs 50 Bars and 2000 Credits.", expected: "Shotgun located." },
      { number: 3, action: "Click the 'Buy/Unlock' button for the Shotgun.", expected: "The transaction is blocked. A clear UI message (or toast notification) informs you that you have insufficient funds/bars." }
    ]
  },
  {
    id: "TS-B-04",
    title: "Leaderboard API & Public Profile Fetching",
    variant: "B",
    context: "The game allows you to view competitors' factories without exposing sensitive user data.",
    steps: [
      { number: 1, action: "From the Main Menu, navigate to the 'Leaderboard'.", expected: "Leaderboard opens." },
      { number: 2, action: "Wait for the list to populate and click on the top-ranking player's username.", expected: "Leaderboard populated." },
      { number: 3, action: "Observe the loaded profile.", expected: "You are taken to a read-only view of that player's Factory Hub. You can see their machine layout, but all upgrade/collect buttons are disabled or hidden." }
    ]
  },
  {
    id: "TS-B-05",
    title: "Destructive Action & Custom Modal (State Wipe)",
    variant: "B",
    context: "Players must be protected from accidentally deleting their save, but the feature must work flawlessly when intended.",
    steps: [
      { number: 1, action: "Go to Options -> Data.", expected: "Data options menu opens." },
      { number: 2, action: "Click the 'Clear Progress' button.", expected: "Confirm action." },
      { number: 3, action: "Observe result.", expected: "A custom, retro-styled confirmation modal appears on-screen (not a standard browser popup)." },
      { number: 4, action: "Click 'YES' to confirm.", expected: "Your progress is wiped. Check the Level Select screen to verify that only Level 1 is available, and your credits are reset to the 500 default." }
    ]
  }
];
