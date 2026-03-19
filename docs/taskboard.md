The complete checklist contains 76 items, and exactly 17 are already marked as completed
I have distributed exactly these 59 core checklist tasks below.

### 1. Miro Slezák (Team Leader & Vercel Hosting) — **9 Tasks**
*Miro’s workload focuses primarily on Vercel deployment configurations and documentation updates.*
*   **1.2 & 2.5:** Add the Next.js/React/Prisma version numbers to the README and document justifications for external libraries.
*   **4.7:** Configure the Next.js `assetPrefix` to enforce the Vercel CDN.
*   **5.1 & 5.5:** Set explicit `Cache-Control` headers for static files and explicitly configure Vercel Edge CDN caching.
*   **10.1 & 10.2:** Officially deploy the application to Vercel and add the live public URL to the README.
*   **10.4 & 10.5:** Create the `.github/workflows/deploy.yml` CI/CD file and document the Blue/Green zero-downtime deployment strategy.

### 2. Dominik Hoch (Backend API, Security & Supabase) — **13 Tasks**
*Dominik handles all database architecture, API endpoints, and server security.*
*   **1.6:** Create the `.env.production.example` configuration file for the Supabase database.
*   **9.4:** Build the API endpoint utilizing Prisma to monitor the number of players and games.
*   **3.1, 3.3, 3.4 & 7.5:** Return explicit HTTP status codes, implement comprehensible error messages, mask internal stack traces, and cleanly reject invalid data with 400 status codes across all APIs.
*   **3.6 & 7.1:** Validate input data by enforcing Zod schemas on incoming JSON payloads.
*   **7.3 & 7.6:** Protect the application against CSRF and enforce `Secure` and `HttpOnly` attributes for JWT cookies.
*   **7.7:** Conduct and document the OWASP Top 10 security check.
*   **8.3:** Write the test suite specifically asserting the rejection of invalid API inputs.
*   **8.6:** Record found server and API errors into the issue tracker.

### 3. Pavlo Kosov (Gameplay, Assets & Git Admin) — **12 Tasks**
*Pavlo focuses on the game engine assets, cross-platform testing, and Git repository administration.*
*   **4.1, 4.2 & 4.10:** Re-enable Next.js image optimization, convert legacy `.bmp` engine textures to `.webp`, and optimize the Largest Contentful Paint element.
*   **5.4:** Implement cache invalidation by appending version strings to texture paths in the engine.
*   **6.4:** Add `aria-label` accessibility attributes to the SVG crosshair and rendering canvas.
*   **8.1 & 8.2:** Test the application in multiple browsers using Playwright and manually document testing on a physical mobile device.
*   **10.3:** Disable the 'P' key debug mode strictly for the live production build.
*   **11.1, 11.2, 11.3 & 11.5:** Export the git commit history, document code authorship, migrate the static TODOs to an issue tracker, and link every bug fix to a specific commit.

### 4. Filip Houdek (State, Analytics & Monitoring) — **12 Tasks**
*Filip handles local dependency maintenance, network caching, and server load monitoring.*
*   **2.3, 2.4 & 2.6:** Add the `pnpm-lock.yaml` file, configure Dependabot for regular updates, and run `depcheck` to remove unused libraries.
*   **3.7 & 4.8:** Enforce GZIP compression for large server responses and transferred data.
*   **5.2 & 5.3:** Set explicit cache configurations for CSS, JavaScript, and images, and write tests to verify cache functionality.
*   **8.4 & 8.5:** Perform Artillery/K6 load testing with multiple concurrent players and conduct a basic server performance test.
*   **9.2, 9.3 & 9.6:** Ensure logs contain timestamps and error types, integrate a log analysis tool like Sentry, and deploy UptimeRobot monitoring.

### 5. Tobiáš Mrázek (Frontend, UI & Team Scrapes) — **13 Tasks**
*Tobiáš handles the React UI component optimizations and documenting the team's post-mortem social dynamics.*
*   **4.3, 4.5 & 4.6:** Strip unused CSS and fonts, analyze HTTP requests upon page load, and implement lazy loading for heavy React components.
*   **4.9:** Conduct and document performance measurements using the Lighthouse tool.
*   **6.3:** Fix the semantic heading structure (`<h1>`, `<h2>`) across the UI.
*   **7.2:** Protect the chart components against XSS using DOMPurify.
*   **12.1 through 12.7:** Add the seven required "Team Scrapes" sentences to the retrospective documentation covering merge conflicts, lost commits, broken builds, deployment breaks, small change cascades, local environment isolation, and the realization that communication is vital.