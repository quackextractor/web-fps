Here is a complete, step-by-step implementation plan to digitize the unmoderated test scenarios into your Next.js/React application, allowing testers to fill them out, submit them to your Supabase database, print them, and export them to PDF.

### Phase 1: Database Schema Modifications (Prisma)
To save the test results, you will need to add new relational models to your Supabase/PostgreSQL database via `prisma/schema.prisma`.

**1. Update `frontend/prisma/schema.prisma`**
Add the following models to represent the tester's session, the scenarios they executed, and their step-by-step results:

```prisma
model TestSession {
  id             String             @id @default(uuid())
  testerName     String
  testDate       DateTime           @default(now())
  durationMin    Int
  observations   String?            // General Observations bounding box
  createdAt      DateTime           @default(now())
  scenarios      ScenarioResult[]
}

model ScenarioResult {
  id             String             @id @default(uuid())
  sessionId      String
  scenarioId     String             // e.g., "TS-A-01"
  issueLog       String?            // Dotted line feedback space
  session        TestSession        @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  steps          StepResult[]
}

model StepResult {
  id               String           @id @default(uuid())
  scenarioResultId String
  stepNumber       Int
  status           String           // "✓", "✗", or "~"
  scenarioResult   ScenarioResult   @relation(fields: [scenarioResultId], references: [id], onDelete: Cascade)
}
```
Run `npx prisma db push` or `npx prisma migrate dev` to apply these changes to Supabase.

### Phase 2: Centralize Scenario Data
Translate the scenarios defined in `scenariosV2.md` into a strongly-typed TypeScript constant so the frontend can render them dynamically. 

**1. Create `frontend/lib/test-scenarios.ts`**
```typescript
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
  // Add TS-A-02 through TS-B-05 here from scenariosV2.md...
];
```

### Phase 3: Build the API Endpoint
Create a secure Next.js API route to receive the filled-out form and write it to the database.

**1. Create `frontend/app/api/qa/submit/route.ts`**
```typescript
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { testerName, durationMin, observations, scenarios } = body;

    const testSession = await prisma.testSession.create({
      data: {
        testerName,
        durationMin: Number(durationMin),
        observations,
        scenarios: {
          create: scenarios.map((scenario: any) => ({
            scenarioId: scenario.id,
            issueLog: scenario.issueLog,
            steps: {
              create: scenario.steps.map((step: any) => ({
                stepNumber: step.number,
                status: step.status,
              }))
            }
          }))
        }
      }
    });

    return NextResponse.json({ success: true, sessionId: testSession.id }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save test results' }, { status: 500 });
  }
}
```

### Phase 4: Construct the Digital QA Interface
Create a dedicated page utilizing your existing Shadcn UI components (Card, Input, Textarea, RadioGroup, and Button) to replicate the A4 paper structure.

**1. Create `frontend/app/qa/page.tsx`**
```tsx
"use client";

import React, { useState, useRef } from "react";
import { QA_SCENARIOS } from "@/lib/test-scenarios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function QATestingPage() {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [testerName, setTesterName] = useState("");
  const [duration, setDuration] = useState("");
  const [observations, setObservations] = useState("");
  const [results, setResults] = useState<Record<string, any>>({});

  const handleStepChange = (scenarioId: string, stepNum: number, status: string) => {
    // State management logic to update nested step status
  };

  const handlePrint = () => window.print();

  const handleSubmit = async () => {
    // Validation omitted for brevity
    const payload = {
        testerName, 
        durationMin: duration, 
        observations,
        scenarios: Object.values(results)
    };
    
    const res = await fetch("/api/qa/submit", {
        method: "POST",
        body: JSON.stringify(payload)
    });
    
    if (res.ok) {
        toast({ title: "Success", description: "Test scenarios saved to database." });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 overflow-y-auto" ref={printRef}>
      <div className="max-w-4xl mx-auto space-y-8 print-container">
        {/* Header - Top 15% */}
        <Card className="bg-gray-950 border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl retro-text text-red-600">INDUSTRIALIST QA</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div className="flex-1"><label>Tester Name:</label><Input value={testerName} onChange={e => setTesterName(e.target.value)} /></div>
            <div className="flex-1"><label>Duration (min):</label><Input type="number" value={duration} onChange={e => setDuration(e.target.value)} /></div>
          </CardContent>
        </Card>

        {/* Action Tables - Middle 50% */}
        {QA_SCENARIOS.map((scenario) => (
          <Card key={scenario.id} className="bg-gray-900 border-gray-800 break-inside-avoid">
            <CardHeader>
              <CardTitle>{scenario.id}: {scenario.title}</CardTitle>
              <p className="text-sm text-gray-400">{scenario.context}</p>
            </CardHeader>
            <CardContent>
              <table className="w-full text-left mb-4 border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th>Step</th><th>Action</th><th>Expected Result</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {scenario.steps.map(step => (
                    <tr key={step.number} className="border-b border-gray-800">
                      <td>{step.number}</td>
                      <td>{step.action}</td>
                      <td>{step.expected}</td>
                      <td className="flex gap-2 p-2">
                        {/* Status Buttons: ✓ / ✗ / ~ */}
                        {["✓", "✗", "~"].map(status => (
                           <Button 
                             key={status} 
                             variant="outline" 
                             size="sm"
                             onClick={() => handleStepChange(scenario.id, step.number, status)}
                           >
                             {status}
                           </Button>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <label>Issue Log (For ✗ or ~ marks):</label>
              <Textarea placeholder="Explain any difficulties here..." className="mt-2" />
            </CardContent>
          </Card>
        ))}

        {/* General Observations - Bottom 35% */}
        <Card className="bg-gray-950 border-gray-800 break-inside-avoid">
            <CardHeader><CardTitle>General Observations</CardTitle></CardHeader>
            <CardContent>
                <Textarea 
                  className="h-32" 
                  placeholder="Record UI confusion, visual glitches, or unexpected behaviors..."
                  value={observations}
                  onChange={e => setObservations(e.target.value)}
                />
            </CardContent>
        </Card>

        {/* Action Buttons (Hidden during print) */}
        <div className="flex gap-4 print:hidden">
            <Button onClick={handleSubmit} variant="default" className="w-full">Submit to Database</Button>
            <Button onClick={handlePrint} variant="secondary" className="w-full">Print / Export to PDF</Button>
        </div>
      </div>
    </div>
  );
}
```

### Phase 5: PDF Export & Print Styling Setup
Instead of bloatware libraries, the most efficient way to generate PDFs in modern web applications is utilizing the browser's native `window.print()` functionality, which allows the user to click "Save as PDF" while retaining perfect CSS styling. 

**1. Update `frontend/app/globals.css`**
Add a print-specific media query to ensure the page formats perfectly for an A4 piece of paper, removing scrolling limits and hiding non-essential UI (like the submit buttons).

```css
@media print {
  body {
    background: white !important;
    color: black !important;
    overflow: visible !important;
    height: auto !important;
  }
  .print\:hidden {
    display: none !important;
  }
  .break-inside-avoid {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .print-container {
    max-width: 100% !important;
    padding: 0 !important;
  }
  /* Force dark mode cards to print nicely */
  [data-slot="card"] {
    background: white !important;
    border: 1px solid #ccc !important;
    color: black !important;
  }
}
```
*(Optional Alternative: If you explicitly need a programmatic PDF generation without the print dialog, install `html2pdf.js` via `npm i html2pdf.js` and bind it to the export button).*

### Phase 6: Main Menu Integration
Finally, link this new page from the Main Menu.

**1. Update `frontend/components/game-ui/MainMenu.tsx`**
Add a new callback to the `MainMenuProps` and a button to access the QA page:
```tsx
interface MainMenuProps {
  // ... existing props
  onQAForm: () => void; 
}

// Inside the return block, add the button:
<MenuButton onClick={onQAForm} variant="secondary">
  QA TESTING FORM
</MenuButton>
```

**2. Update `frontend/components/fps-game.tsx`**
Add the `qa` state to your `GameState` type and map the routing:
```tsx
type GameState = "mainMenu" | "levelSelect" | ... | "qa";

// In the MainMenu implementation:
<MainMenu
  // ...
  onQAForm={() => window.location.href = '/qa'} // Or use Next.js Router
/>
```


Yes, I missed a few critical, project-specific architecture and security standards required by your codebase, as well as an exact field mapping from your test scenario document. 

Here is the important missing information to ensure your implementation aligns perfectly with the rest of your application:

### 1. Missing Vercel Build Directives & Security Standards (API Endpoint)
In the previous plan, the Next.js API route lacked three strict backend standards established in your project:
*   **`force-dynamic` Directive:** All database-mutating Next.js App Router API endpoints in your project must explicitly export `dynamic = 'force-dynamic'` to prevent build-time static evaluation (SSG) crashes on Vercel.
*   **Zod Schema Validation:** Your project enforces strict `zod` payload validation for all endpoints, explicitly rejecting malformed requests with a `400 Bad Request` to satisfy your OWASP security audit.
*   **Error Masking & Centralized Logging:** Internal server errors must be securely logged using your custom `logger.error()` utility (`@/lib/logger`) and masked in the response to prevent stack trace leaks.

**Corrected `frontend/app/api/qa/submit/route.ts`:**
```typescript
export const dynamic = 'force-dynamic'; // Prevents Vercel SSG crashes
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';

// Strict payload validation
const qaPayloadSchema = z.object({
  testerName: z.string().min(1, "Name required"),
  testDate: z.string().optional(),
  durationMin: z.number().min(1, "Duration required"),
  observations: z.string().optional(),
  scenarios: z.array(z.any()) 
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = qaPayloadSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid or incomplete data' }, { status: 400 });
    }

    const { testerName, testDate, durationMin, observations, scenarios } = parsed.data;

    const testSession = await prisma.testSession.create({
      data: {
        testerName,
        testDate: testDate ? new Date(testDate) : new Date(),
        durationMin,
        observations,
        scenarios: {
          create: scenarios.map((scenario: any) => ({
            scenarioId: scenario.id,
            issueLog: scenario.issueLog,
            steps: {
              create: scenario.steps.map((step: any) => ({
                stepNumber: step.number,
                status: step.status,
              }))
            }
          }))
        }
      }
    });

    return NextResponse.json({ success: true, sessionId: testSession.id }, { status: 200 });
  } catch (error) {
    // Mask internal details while logging error for the team
    logger.error('QA Submission failed:', error);
    return NextResponse.json({ error: 'Failed to save test results' }, { status: 500 });
  }
}
```

### 2. Missing "Date" Field in the UI Header
According to the physical A4 paper spec in `scenariosV2.md`, the top 15% header must include **Tester Name**, **Date**, and **Duration**. The previous UI code missed the Date field. 

**Add this to your `frontend/app/qa/page.tsx` state:**
```tsx
const [testDate, setTestDate] = useState(new Date().toISOString().split('T'));
```
**Add this to the Header CardContent:**
```tsx
<div className="flex-1">
  <label>Date:</label>
  <Input type="date" value={testDate} onChange={e => setTestDate(e.target.value)} />
</div>
```

### 3. Missing Scenario "TS-A-02" Mapping
In the `test-scenarios.ts` array, I omitted the specific data for the second scenario. Here is the exact mapping for **TS-A-02** based on your document:

```typescript
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
}
```

Yes, based on the provided design document for the test scenarios (`scenariosV2.md`) and your codebase's internal architecture, there are a few more highly specific details missing from the implementation plan:

### 1. The "Fresh State" Testing Prerequisite
The document explicitly states that because these tests are unmoderated, they **must be completed from a completely fresh state (no preloading)** relying strictly on the default 500 credits, base weapons, and Level 1 access. 
*   **Missing Implementation:** Your QA page needs to instruct the tester to clear their local storage before starting. You should import `useGameActions()` or `useEconomy()` to provide a button at the top of the form that programmatically fires the existing `clearProgress()` function to guarantee this fresh state before they begin testing.

### 2. Exact Visual Layout Constraints & Excluded Sections
The physical A4 paper layout dictates very specific visual formatting for the bottom 35% of the page that standard Textareas don't perfectly replicate:
*   **Issue Log Formatting:** The issue log space must specifically feature **"4 wide, dotted lines"** for testers to explain any `✗` or `~` marks.
*   **General Observations:** This must be a **"rectangular bounded box (approx. 5cm high)"**. 
*   **Excluded Sections:** The document explicitly mandates that the **"Missing Functionality" and "Closing Questions"** sections have been *completely removed* from the template, so you must ensure they are never rendered in the digital version.

### 3. Missing Variant B (Economy/Tycoon) Scenarios
The initial plan only accounted for the FPS Action (Variant A). You are missing the 5 scenarios for **Variant B**, which focus on the Tycoon/Economy and Meta-Progression modules. You need to append these to your `QA_SCENARIOS` array:
*   **TS-B-01 (Authentication & JWT Verification):** Tests entering a username/password, verifying secure login, and checking that the cloud status indicator updates to "synced".
*   **TS-B-02 (Factory Hub & Passive Income Generation):** Tests accessing the Factory Hub, verifying the 500 starting credits, buying a Red Ore Factory for 200 credits, and observing the progress bar/timer.
*   **TS-B-03 (The Armory & Insufficient Funds Handling):** Tests attempting to buy the Shotgun (which costs 50 Bars and 2000 Credits) to ensure the transaction is safely blocked with a UI error/toast.
*   **TS-B-04 (Leaderboard API & Public Profile Fetching):** Tests clicking a top-ranking player on the Leaderboard to ensure it loads a read-only, safely restricted view of their Factory Hub.
*   **TS-B-05 (Destructive Action & Custom Modal):** Tests the "Clear Progress" button in Options -> Data to ensure the custom retro-styled modal appears and properly resets credits to 500 and locks levels.

### 4. CSRF Middleware Inheritance
It is important to note that your newly created `POST /api/qa/submit` endpoint will automatically inherit your application's global CSRF protection. According to `frontend/middleware.ts`, all `POST` requests directed at `/api/:path*` are strictly intercepted to validate the `Origin` and `Referer` headers against the host. 
*   **What this means:** You do not need to build custom authentication for the QA endpoint, but you must ensure your testers access the QA form via the official Vercel domain or `localhost`, otherwise the middleware will silently reject their form submissions.