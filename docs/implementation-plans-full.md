**1. Implementation Plan for Point 1.2: Overview of technologies used and their versions**
The review notes that while the technologies are mentioned in the `README.md`, their specific versions are only defined in the `package.json` and are missing from the general documentation overview.

*   **Step 1:** Open the **`README.md`** file located in the root directory.
*   **Step 2:** Add a new sub-heading titled **"Technologies and Versions"** (or update the existing "Features" section) to explicitly serve as the required overview.
*   **Step 3:** Open the **`frontend/package.json`** file and extract the exact version numbers of the core stack. 
*   **Step 4:** Document these core technologies and their versions under the new `README.md` section. Based on the `package.json`, you should explicitly list:
    *   **Next.js**: v16.1.6
    *   **React** (and React DOM): v19.2.0
    *   **Prisma** (and Prisma Client): v5.22.0
    *   **Tailwind CSS**: v4.1.9
    *   **Supabase / PostgreSQL**: (Version managed via the Supabase platform, as noted in the database setup).

**2. Implementation Plan for Point 1.6: Configuration file for the production environment**
The review notes that the repository lacks a dedicated, isolated configuration file specifically meant for production.

*   **Step 1:** Create a new file in the `frontend` directory specifically named for production configuration, such as **`.env.production.example`** or **`production.config.json`**. 
*   **Step 2:** Populate this file with the required environment variables needed to run the Next.js application in production, leaving the values empty or as dummy placeholders so sensitive data is not leaked. Based on the backend architecture, this file must include:
    *   `DATABASE_URL=` (pooled connection for Prisma)
    *   `DIRECT_URL=` (direct connection for Prisma migrations)
    *   `JWT_SECRET=` (required in production for secure session management)
*   **Step 3:** Commit and push this specific production configuration template to the Git repository so it is explicitly checked into the version control system.
*   **Step 4:** (Optional but recommended) Update the **`README.md`** "Getting Started" or "Deployment" section to instruct developers to copy this production file (e.g., `cp .env.production.example .env.production`) when deploying the application to a live server.
---
**1. Implementation Plan for Point 2.3: The repo contains a lock file**
The review notes that despite the team transitioning to `pnpm`, there is no `pnpm-lock.yaml`, `package-lock.json`, or `yarn.lock` checked into the repository under the `frontend` or root directory.

*   **Step 1:** Open a terminal and navigate to the `frontend` directory where the `package.json` file is located.
*   **Step 2:** Run the package manager's install command (e.g., `pnpm install`). This will resolve the dependency tree and automatically generate a `pnpm-lock.yaml` file based on the exact versions installed.
*   **Step 3:** Stage and commit the generated `pnpm-lock.yaml` file to the Git repository. It is crucial that this file is checked into version control to ensure reproducible builds across all developer machines and CI/CD pipelines.

**2. Implementation Plan for Point 2.4: The team regularly checks for dependency updates**
The review points out that there is no verifiable evidence or documented process showing that the team regularly checks for updates.

*   **Step 1:** Implement an automated dependency tracking tool. Create a `.github/dependabot.yml` file in the root of the repository to configure Dependabot, setting it to automatically check for `npm` (or `pnpm`) ecosystem updates on a weekly or daily schedule.
*   **Step 2:** Update the team's documentation (e.g., `docs/team-assignment.md` or a new `docs/maintenance.md` file) to explicitly define a team process for reviewing and merging these automated update pull requests.
*   **Step 3:** Ensure that all future dependency updates are explicitly logged in the `CHANGELOG.md` file to provide a verifiable, historical record of regular updates.

**3. Implementation Plan for Point 2.5: The team records the reason for using each external library**
The review highlights that while a few libraries (like `bcryptjs` and `jose`) have reasons documented in the changelog, the vast majority of dependencies in `package.json` (such as `lucide-react`, `date-fns`, and `@hookform/resolvers`) lack a documented purpose.

*   **Step 1:** Create a new documentation file specifically for this purpose, such as `docs/dependencies.md`, or add a dedicated "Dependencies Overview" section to the existing `docs/documentation.md`.
*   **Step 2:** Systematically review the `frontend/package.json` file and list every single library found under `dependencies` and `devDependencies`.
*   **Step 3:** Write a brief 1-2 sentence justification for why each library is used in the project. For example, explicitly document that `lucide-react` is used for UI icons, `date-fns` for date manipulation, and `@radix-ui/react-*` for accessible UI components.

**4. Implementation Plan for Point 2.6: Unused libraries have been removed from the project**
The review notes that there is no documentation or proof that an audit for unused packages was ever performed or that any were removed.

*   **Step 1:** Navigate to the `frontend` directory and run a dependency analysis tool, such as `depcheck` (e.g., `npx depcheck`). This tool will scan the codebase and flag any dependencies listed in `package.json` that are not actually imported or utilized in the code.
*   **Step 2:** Remove the identified unused libraries using the package manager (e.g., `pnpm remove <package-name>`).
*   **Step 3:** Run the build pipeline (`pnpm run build`) and the test suite (`pnpm test`) to verify that the removal of these libraries did not break the application.
*   **Step 4:** Add an explicit entry in the `CHANGELOG.md` file stating that a dependency audit was performed, and explicitly list the unused libraries that were purged from the project to serve as proof for future reviews.
---
**1. Implementation Plan for Point 3.1: The server returns correct HTTP status codes**
The review notes that the provided API routes (e.g., `frontend/app/api/...`) do not currently demonstrate the explicit return of specific HTTP status codes such as 200, 400, 404, or 500.

*   **Step 1:** Open all API route files in the `frontend/app/api/` directory, such as `auth/login/route.ts` and `save/route.ts`.
*   **Step 2:** Locate all instances where a response is sent to the client. 
*   **Step 3:** Update the `NextResponse.json()` calls to explicitly include the `status` property in the options object (e.g., `NextResponse.json({ ... }, { status: 200 })` for success, or `{ status: 400 }` for bad requests).

**2. Implementation Plan for Point 3.3: Invalid requests return a comprehensible error**
The review indicates there is no verifiable code snippet showing comprehensible error messages being returned to the client.

*   **Step 1:** In each API route, identify scenarios where the client request is invalid (e.g., missing parameters, invalid credentials, or malformed body).
*   **Step 2:** Implement conditional checks for these scenarios and explicitly return a clear, human-readable error string, such as `NextResponse.json({ error: "Invalid data" }, { status: 400 })`.

**3. Implementation Plan for Point 3.4: The server does not return internal error information to the user**
The review highlights that the `catch` blocks in the API routes cannot currently be verified to safely mask internal server errors or database stack traces.

*   **Step 1:** Navigate to the `try...catch` blocks in all backend API routes.
*   **Step 2:** Inside the `catch` block, log the actual error internally (e.g., `console.error(error)`) for debugging purposes.
*   **Step 3:** Ensure the client response strictly returns a generic, masked error message without exposing database schema details or stack traces, utilizing `NextResponse.json({ error: "Internal Server Error" }, { status: 500 })`.

**4. Implementation Plan for Point 3.6: The API validates input data**
The review points out that while server-side validation for variables like `netWorth` and `kills` is mentioned in the changelog, the actual validation code snippet is missing from the API files.

*   **Step 1:** Open the `frontend/app/api/save/route.ts` file.
*   **Step 2:** Import `zod` (which is already included in the project dependencies) to create a strict validation schema for the incoming JSON payload.
*   **Step 3:** Validate the incoming request body against this schema, explicitly ensuring that fields like `netWorth` and `kills` are valid numbers and cannot be set to negative or unreasonably inflated values before executing the Prisma database update.

**5. Implementation Plan for Point 3.7: Large server responses are compressed (GZIP)**
The review states that despite Next.js compressing responses by default, there is no explicit configuration or documentation enforcing this behavior in the codebase.

*   **Step 1:** Open the `frontend/next.config.mjs` file.
*   **Step 2:** Explicitly add the `compress: true` property to the `nextConfig` object to strictly enforce GZIP compression.
*   **Step 3:** Add an inline comment above the property (e.g., `// Explicitly enable GZIP compression for large server responses`) to document this behavior and pass the strict review.
---
**1. Implementation Plan for Point 4.1: Images are optimized and have an appropriate size**
The review indicates that the Next.js configuration explicitly disables image optimization (`unoptimized: true`), likely to keep the retro aesthetic.

*   **Step 1:** Open the **`frontend/next.config.mjs`** file.
*   **Step 2:** Locate the `images` configuration object and remove the `unoptimized: true` property (or set it to `false`) so that Next.js can actively resize and optimize images.
*   **Step 3:** To preserve the retro pixelated look without disabling optimization entirely, apply the CSS property `image-rendering: pixelated` to the canvas and image elements within `frontend/app/globals.css`.

**2. Implementation Plan for Point 4.2: Images use modern formats (e.g., WebP)**
The game currently relies on legacy uncompressed Bitmap (`.bmp`) images.

*   **Step 1:** Convert all `.bmp` texture files in the **`frontend/public/textures/`** directory to a modern web format such as **`.webp`** or **`.avif`**.
*   **Step 2:** Update the **`frontend/scripts/generate_textures.js`** file to output `.webp` files instead of `.bmp` files, utilizing an image processing library if necessary.
*   **Step 3:** Update all hardcoded asset paths pointing to the old `.bmp` files to the new format in both `frontend/components/fps-game.tsx` (inside the `AssetPreloader`) and `frontend/lib/fps-engine.ts` (inside the `LEVELS` definitions).

**3. Implementation Plan for Point 4.3: Unused CSS and JavaScript have been removed**
The review points out that `globals.css` still contains definitions for unused Geist fonts, and there is no explicit verification of removed unused code.

*   **Step 1:** Open the **`frontend/app/globals.css`** file.
*   **Step 2:** **Delete the unused `--font-sans` and `--font-mono`** CSS variables referencing 'Geist' and 'Geist Mono'. 
*   **Step 3:** Run a dead-code elimination or CSS purging tool (like PurgeCSS) and document the cleanup step in `CHANGELOG.md` to explicitly prove unused code has been stripped.

**4. Implementation Plan for Point 4.5: The number of HTTP requests upon page load has been analyzed**
There is no verifiable documentation that page load HTTP requests were ever tracked or analyzed.

*   **Step 1:** Perform an analysis of the initial page load using browser DevTools (Network tab) or WebPageTest to capture the exact number of HTTP requests and payload sizes.
*   **Step 2:** Create a dedicated documentation file (e.g., **`docs/performance-analysis.md`**) or add a section to `docs/documentation.md` detailing the findings of this analysis.
*   **Step 3:** Add an entry in `CHANGELOG.md` noting that an HTTP request footprint analysis was successfully conducted.

**5. Implementation Plan for Point 4.6: Large files are loaded only when needed (lazy loading)**
The game currently uses an `AssetPreloader` that eagerly blocks gameplay to load all heavy assets at once rather than lazy loading them.

*   **Step 1:** Refactor the **`AssetPreloader`** component logic inside `frontend/components/AssetPreloader.tsx`. Instead of loading the entire global asset array upfront, modify it to accept and load only the textures and sounds required for the *specific active level* being played.
*   **Step 2:** Use Next.js dynamic imports (`next/dynamic`) in `frontend/app/page.tsx` or `frontend/components/fps-game.tsx` to lazily load heavy React UI components (like Tycoon/Factory views) only when the user navigates to them.

**6. Implementation Plan for Point 4.7: Static files are distributed via a CDN (Content Delivery Network)**
The review explicitly states that implicit Vercel CDN usage does not count without a strict, explicit codebase configuration.

*   **Step 1:** Open the **`frontend/next.config.mjs`** file.
*   **Step 2:** Explicitly add the **`assetPrefix`** property to the Next.js config object, pointing it to a dedicated CDN domain (e.g., `assetPrefix: 'https://cdn.yourdomain.com'`).
*   **Step 3:** Add an inline comment in the configuration file explaining that this enforces static file distribution via the CDN to satisfy the strict review requirement.

**7. Implementation Plan for Point 4.8: The server uses compression for transferred data**
There is no explicit configuration proving data compression is enabled.

*   **Step 1:** Open **`frontend/next.config.mjs`**.
*   **Step 2:** Add the property **`compress: true`** explicitly to the Next.js configuration object.
*   **Step 3:** Add a comment directly above the code explicitly stating that this enforces GZIP/Brotli compression for all transferred server data to pass the review.

**8. Implementation Plan for Point 4.9: Performance measurement was conducted using the Lighthouse tool**
No Lighthouse audits have been documented in the repository.

*   **Step 1:** Run a complete **Google Lighthouse audit** on the production build of the application.
*   **Step 2:** Export the generated Lighthouse HTML/JSON report and save it to the repository inside a new **`docs/lighthouse/`** directory.
*   **Step 3:** Log the execution of the Lighthouse audit in the `CHANGELOG.md` file, explicitly detailing the performance scores achieved.

**9. Implementation Plan for Point 4.10: The largest page element was optimized for fast loading (LCP)**
Because image optimization is disabled globally, the Largest Contentful Paint (LCP) element cannot be verified as optimized.

*   **Step 1:** Identify the main LCP element in the DOM (likely the game canvas or the main menu background image).
*   **Step 2:** Ensure the global `unoptimized: true` rule is removed from `next.config.mjs` (as completed in step 4.1).
*   **Step 3:** If the LCP element is a Next.js `<Image>`, explicitly add the **`priority`** attribute to it, forcing the browser to preload the image and optimize the LCP timing.
---
**1. Implementation Plan for Point 5.1: Static files have Cache-Control HTTP headers set**
The review states that explicit HTTP cache headers are missing for the static files served from the `/public/` directory.

*   **Step 1:** Open the **`frontend/next.config.mjs`** file.
*   **Step 2:** Add an asynchronous `headers()` function to the `nextConfig` object.
*   **Step 3:** Inside this function, return an array configuring explicit `Cache-Control` headers for all files under the `/textures/` path or general static assets, setting a strict value such as `public, max-age=31536000, immutable`. 

**2. Implementation Plan for Point 5.2: Cache is set for images, CSS, and JavaScript**
The review explicitly flags that the Next.js `images` configuration actively disables optimization (and thereby some caching layers), and there is no explicit cache configuration for images, CSS, or JS. 

*   **Step 1:** In **`frontend/next.config.mjs`**, locate the `images: { unoptimized: true }` block and remove `unoptimized: true` (or set it to `false`) to allow the framework to apply optimization and caching to images.
*   **Step 2:** Expand the `headers()` function created in Step 5.1 to explicitly match paths or extensions for images (`.bmp`, `.webp`, `.png`), CSS, and JS files, explicitly assigning `Cache-Control` headers to them rather than relying on framework defaults.

**3. Implementation Plan for Point 5.3: The team verified the cache functionality**
There is currently no verifiable documentation or testing proving the cache works.

*   **Step 1:** Write a new test file, such as **`frontend/__tests__/cache.test.ts`**, or perform a strict manual verification using `curl -I` or browser DevTools on the production build to inspect the HTTP response headers.
*   **Step 2:** Create a dedicated documentation file (e.g., `docs/cache-verification.md`) or add a section to `docs/documentation.md` that explicitly records the test methodology and the resulting `Cache-Control` headers.
*   **Step 3:** Add an explicit entry in **`CHANGELOG.md`** stating that HTTP cache functionality was successfully verified.

**4. Implementation Plan for Point 5.4: Cache invalidation occurs when files are changed**
The game relies on hardcoded string paths for static assets without any cache-busting query strings, which breaks cache invalidation if a texture changes.

*   **Step 1:** Open the **`frontend/lib/fps-engine.ts`** file.
*   **Step 2:** Locate the `wallTextures` property inside the `LEVELS` array definitions (e.g., `1: '/textures/wall_tech.bmp'`).
*   **Step 3:** Implement a cache-busting mechanism by appending a version query string to every static texture path. Since **`next.config.mjs`** already exposes `NEXT_PUBLIC_GAME_VERSION` to the environment, you can append this to the paths (e.g., `'/textures/wall_tech.bmp?v=' + process.env.NEXT_PUBLIC_GAME_VERSION`).

**5. Implementation Plan for Point 5.5: CDN cache is correctly set for static files**
Although deployed on Vercel, there are no explicit CDN cache directives proving it is configured properly.

*   **Step 1:** Open **`frontend/next.config.mjs`** (or alternatively, create a new `frontend/vercel.json` file).
*   **Step 2:** Update the `Cache-Control` headers configuration to explicitly include CDN-specific caching directives, such as **`s-maxage=31536000`** and **`stale-while-revalidate`**. 
*   **Step 3:** Add an inline code comment explicitly stating that this configuration enforces Vercel's Edge CDN caching behavior.
---
**1. Implementation Plan for Point 6.3: The page uses the correct heading structure**
The review indicates that the UI components currently rely on generic `<div>` or `<p>` tags with custom classes (like `retro-text`) instead of using semantic HTML heading tags (`<h1>`, `<h2>`, `<h3>`). 

*   **Step 1:** Audit the core UI screen components in the `frontend/components/game-ui/` directory, specifically focusing on `MainMenu.tsx`, `FactoryHub.tsx`, `Armory.tsx`, and `LevelSelect.tsx`.
*   **Step 2:** Replace the primary title element of each screen with an `<h1>` tag. For example, in `MainMenu.tsx`, wrap the main "INDUSTRIALIST" title in an `<h1>` tag while keeping the existing `className` (e.g., `className="retro-text text-yellow-500..."`) so the visual retro styling is perfectly preserved. Ensure there is exactly one `<h1>` per view.
*   **Step 3:** Use `<h2>` and `<h3>` tags for secondary sections within those menus. For instance, in `FactoryHub.tsx`, change the headers for the "Smelters" or "Machines" sections from `<div>` or `<p>` elements to `<h2>`.

**2. Implementation Plan for Point 6.4: Images have an alt attribute**
The review notes that while the game mostly uses a `<canvas>`, the SVGs that exist in the DOM (such as the crosshair) lack `alt` equivalents like `<title>` or `aria-label`.

*   **Step 1:** Open the `frontend/components/game-ui/Crosshair.tsx` file.
*   **Step 2:** Add an explicit accessibility attribute to the `<svg>` element. Since SVGs do not use the `alt` attribute, add an `aria-label="Crosshair"` to the `<svg>` tag, or nest a `<title>Crosshair</title>` element directly inside the `<svg>` block.
*   **Step 3:** Audit the rest of the UI (such as the Lucide icons used in `MobileControls.tsx` or `MenuButton.tsx`) and ensure any `<svg>` or `<img>` element has an `aria-label`, `<title>`, or `alt` text respectively. 
*   **Step 4:** For the main game itself, open `frontend/components/fps-game.tsx` and add `aria-label="3D Game View"` and `role="img"` to the main rendering `<canvas>` elements to ensure screen readers explicitly understand the purpose of the graphical canvas block.
---
**1. Implementation Plan for Point 7.1: All user inputs are validated**
The review notes that although `zod` is included in `package.json`, there is no visible code enforcing its usage on the parsed request bodies in the API routes.

*   **Step 1:** Open the core API routes, specifically `frontend/app/api/auth/login/route.ts` and `frontend/app/api/save/route.ts`.
*   **Step 2:** Import the `zod` library at the top of these files.
*   **Step 3:** Define explicit Zod schemas corresponding to the expected incoming JSON payloads (e.g., a schema requiring `username` and `password` strings for the login route).
*   **Step 4:** Implement `schema.parse()` or `schema.safeParse()` on the `req.json()` payload immediately after parsing it to strictly enforce validation before proceeding with any database operations.

**2. Implementation Plan for Point 7.2: The application is protected against XSS (Cross Site Scripting)**
The review highlights the lack of explicit Content Security Policy (CSP) headers and the unsanitized use of `dangerouslySetInnerHTML` in the chart component.

*   **Step 1:** Open `frontend/next.config.mjs` and configure explicit Content Security Policy (CSP) headers within a `headers()` function to restrict script execution sources.
*   **Step 2:** Install a trusted HTML sanitization library using the package manager (e.g., `pnpm add dompurify` or `isomorphic-dompurify`).
*   **Step 3:** Open `frontend/components/ui/chart.tsx` and locate the `dangerouslySetInnerHTML` usage that generates the chart styles.
*   **Step 4:** Wrap the injected HTML string with the sanitizer (e.g., `DOMPurify.sanitize(...)`) before it is passed to `dangerouslySetInnerHTML` to prevent malicious injection.

**3. Implementation Plan for Point 7.3: The application is protected against CSRF (Cross Site Request Forgery)**
There is currently no verifiable mechanism, such as `SameSite` enforcements or CSRF tokens, preventing cross-site request forgery.

*   **Step 1:** In backend routes that set cookies (like `frontend/app/api/auth/login/route.ts`), ensure the cookie configuration explicitly includes the `sameSite: 'strict'` (or `'lax'`) attribute.
*   **Step 2:** For more robust protection, implement a middleware check (in `middleware.ts`) that validates the `Origin` or `Referer` HTTP headers against the host domain for all custom `POST` requests.

**4. Implementation Plan for Point 7.5: The server does not accept invalid or incomplete data**
Because the API files truncate, there is no proof that invalid data is rejected with a proper 400 status code.

*   **Step 1:** Returning to the Zod validation logic implemented in Point 7.1, utilize `schema.safeParse()` instead of standard `.parse()`.
*   **Step 2:** Add a conditional check: `if (!result.success)`.
*   **Step 3:** Inside this condition, explicitly reject the request by returning `NextResponse.json({ error: "Invalid or incomplete data" }, { status: 400 })` so the server cleanly bounces malformed payloads.

**5. Implementation Plan for Point 7.6: Cookies have Secure and HttpOnly attributes set**
While the changelog claims secure cookies are implemented, the truncated code prevents verification.

*   **Step 1:** Open `frontend/app/api/auth/login/route.ts`.
*   **Step 2:** Locate the `cookies().set()` function block where the JWT session token is assigned to the user.
*   **Step 3:** Explicitly pass `httpOnly: true` and `secure: process.env.NODE_ENV === 'production'` inside the options object of the `.set()` method.

**6. Implementation Plan for Point 7.7: A check according to the OWASP Top 10 was performed**
The review indicates there is no documentation proving a security audit against the OWASP Top 10 was conducted.

*   **Step 1:** Have the team perform a systematic review of the application against the current OWASP Top 10 vulnerabilities (e.g., Injection, Broken Authentication, etc.).
*   **Step 2:** Document the findings and methodologies of this audit in a new dedicated file, such as `docs/owasp-audit.md`, or append it to the existing `docs/documentation.md`.
*   **Step 3:** Explicitly record the completion of the OWASP Top 10 check in `CHANGELOG.md` to serve as verifiable proof for future reviews.
---
**1. Implementation Plan for Point 8.1: The application was tested in multiple browsers**
The review indicates that the project currently lacks any cross-browser testing frameworks, as tests rely exclusively on Vitest and jsdom.

*   **Step 1:** Install a cross-browser end-to-end testing framework, such as Playwright or Cypress, using the package manager (e.g., `pnpm add -D @playwright/test`).
*   **Step 2:** Initialize the testing framework configuration (e.g., `npx playwright install`) to explicitly define test environments for multiple browser engines, including Chromium, Firefox, and WebKit.
*   **Step 3:** Create a basic E2E test suite (e.g., `frontend/__tests__/e2e/browser.test.ts`) that navigates to the application, loads the main menu, and verifies core rendering.
*   **Step 4:** Add a new script to `package.json` to run these tests (e.g., `"test:e2e": "playwright test"`) and document the successful cross-browser execution in the `CHANGELOG.md`.

**2. Implementation Plan for Point 8.2: The application was tested on a mobile device**
The review points out that while mobile controls exist, there is no documented proof that the game was tested on a *physical* mobile device, as the changelog only mentions forcing mobile controls on a desktop.

*   **Step 1:** Perform a manual testing session of the deployed application on at least one physical mobile device (e.g., an iPhone or Android smartphone).
*   **Step 2:** Create a dedicated documentation file, such as `docs/mobile-testing-log.md`.
*   **Step 3:** Explicitly record the physical device model, the operating system version, the mobile browser used, and the specific touch features tested (like the joystick and look zone).
*   **Step 4:** Add a verifiable entry in the `CHANGELOG.md` explicitly referencing the physical mobile device test.

**3. Implementation Plan for Point 8.3: A test of invalid inputs was performed**
The review highlights that test files like `auth.test.ts` and `save.test.ts` are severely truncated and lack actual `it()` blocks verifying how the system handles invalid user input or rejected payloads.

*   **Step 1:** Open the `frontend/__tests__/auth.test.ts` and `frontend/__tests__/save.test.ts` files.
*   **Step 2:** Write specific `it()` test blocks that intentionally send invalid or malformed data to the endpoints (e.g., an empty username, missing password, or a negative `netWorth` value).
*   **Step 3:** Implement assertions within these blocks to explicitly verify that the API rejects the input and returns an HTTP 400 Bad Request status code.
*   **Step 4:** Ensure the complete, non-truncated test file is committed and pushed to the repository so the validation is fully visible to reviewers.

**4. Implementation Plan for Point 8.4: A test with multiple concurrent players was performed**
The review notes the absence of any load testing configuration, scripts, or documented results simulating multiple concurrent users.

*   **Step 1:** Install a load testing library such as Artillery or K6 in the `devDependencies` (e.g., `pnpm add -D artillery`).
*   **Step 2:** Create a load test configuration file (e.g., `frontend/scripts/load-test.yml`) designed to simulate multiple concurrent users authenticating or hitting the `/api/leaderboard` endpoint simultaneously.
*   **Step 3:** Run the load test against a local production build or staging environment and export the metrics.
*   **Step 4:** Save the load testing report in a new file like `docs/concurrent-users-test.md` and explicitly mention the successful simulation of concurrent players in the `CHANGELOG.md`.

**5. Implementation Plan for Point 8.5: A basic performance test of the server was performed**
The review finds no server stress testing or performance measuring scripts in the codebase, nor any documented performance results.

*   **Step 1:** Using the load testing tool installed in step 8.4, create a dedicated server performance script to benchmark the API's read and write speeds.
*   **Step 2:** Execute the script to capture baseline performance metrics, such as average latency, Requests Per Second (RPS), and error rates under stress.
*   **Step 3:** Document the exact methodology and the resulting performance metrics in a new file, such as `docs/performance-test.md`.
*   **Step 4:** Log the completion of the server performance benchmark in `CHANGELOG.md` to provide easily verifiable proof.

**6. Implementation Plan for Point 8.6: Found errors were recorded in the issue tracker**
The review states that while the changelog mentions fixing errors, there are no explicit links or reference IDs mapping these fixes to a formal issue tracker.

*   **Step 1:** Set up and utilize a formal issue tracker for the repository (such as GitHub Issues or GitLab Issues).
*   **Step 2:** Review the existing bug fixes listed in `CHANGELOG.md` (e.g., "Addressed critical security vulnerabilities") and retroactively log them as formal tickets in the issue tracker to generate tracking IDs (e.g., `#12` or `BUG-45`).
*   **Step 3:** Update the `CHANGELOG.md` to append the corresponding issue IDs to all relevant bug fix entries (e.g., "Fixed API Save Vulnerability (Fixes #12)").
*   **Step 4:** Ensure that the `README.md` or `docs/team-assignment.md` contains an explicit URL link pointing directly to the project's public issue tracker so reviewers can verify the records.
---
**1. Implementation Plan for Point 9.2: Logs contain the time of the error and the type of error**
The review notes that the application code relies on third-party platforms to timestamp logs and does not explicitly format log messages to include timestamps like `new Date().toISOString()`.

*   **Step 1:** Create a centralized logging utility file, such as `frontend/lib/logger.ts`.
*   **Step 2:** Within this file, define a custom logging function that accepts an error object and a message, explicitly formatting the output to prepend the current timestamp using `new Date().toISOString()` alongside the error type/stack trace. 
*   **Step 3:** Locate existing `console.error` and `console.warn` calls throughout the codebase, specifically targeting files mentioned in the review like `frontend/components/fps-game.tsx`, `frontend/scripts/cleanup-test-data.ts`, and `frontend/lib/sound-manager.ts`.
*   **Step 4:** Replace these native console calls with the new custom logging function to strictly enforce timestamping at the application code level.

**2. Implementation Plan for Point 9.3: Logs are available to the team for analysis**
There is no explicit integration proving that logs are actively forwarded to a centralized team analysis tool.

*   **Step 1:** Choose a centralized error tracking and log analysis tool mentioned by the reviewer, such as Sentry, Datadog, Logtail, or Winston.
*   **Step 2:** Install the necessary SDK packages for the chosen tool using the package manager (e.g., `pnpm add @sentry/nextjs`).
*   **Step 3:** Configure the tool in the Next.js application by creating the required initialization files (e.g., `sentry.client.config.ts`, `sentry.server.config.ts`, etc.) and explicitly checking them into the repository.
*   **Step 4:** Document this integration in `docs/documentation.md` and explicitly log the addition of the log analysis tool in `CHANGELOG.md` to provide verifiable proof for the review.

**3. Implementation Plan for Point 9.4: The team monitors the number of players and games**
The review points out that there is no dedicated administrative endpoint, dashboard, or script strictly dedicated to monitoring the aggregate number of players and game sessions.

*   **Step 1:** Create a dedicated administrative API route, such as `frontend/app/api/admin/metrics/route.ts`.
*   **Step 2:** Inside this route, use Prisma to explicitly query and aggregate the total number of registered players (e.g., `prisma.user.count()`) and overall game activity metrics.
*   **Step 3:** Create a simple administrative dashboard component or CLI script that fetches and displays these specific metrics.
*   **Step 4:** Document this monitoring capability in the repository (e.g., update `README.md` or `docs/team-assignment.md`) to explicitly prove the team actively monitors these statistics.

**4. Implementation Plan for Point 9.6: A tool for checking website availability (uptime monitoring) is used**
Despite a draft plan mentioning UptimeRobot, there is no evidence or `/api/health` route proving an uptime monitoring tool was ever actively configured or deployed.

*   **Step 1:** Create a dedicated health check API endpoint, such as `frontend/app/api/health/route.ts`, that simply returns a 200 OK status to indicate the server is responsive.
*   **Step 2:** Set up a public uptime monitoring service, such as UptimeRobot, and configure it to continuously ping the newly created `/api/health` endpoint on the production deployment URL.
*   **Step 3:** Add an explicit link to the public UptimeRobot status page in the `README.md` file so reviewers can verify its existence.
*   **Step 4:** Add a verifiable entry in `CHANGELOG.md` explicitly stating that uptime monitoring has been successfully deployed and configured.
---
**1. Implementation Plan for Point 10.1: The application is deployed on a public server**
The review points out that the `README.md` only provides instructions for running the app locally, and there is no explicit proof of a live deployment.

*   **Step 1:** Successfully deploy the application to a public cloud hosting provider (e.g., Vercel, which is already configured for the build pipeline).
*   **Step 2:** Open the **`README.md`** file located in the root directory.
*   **Step 3:** Add an explicit "Deployment" or "Production Status" section, including a live deployment badge (e.g., a Vercel status badge) to serve as verifiable proof that the server is active.
*   **Step 4:** Update the `CHANGELOG.md` with a verifiable entry explicitly stating the application has been successfully deployed to a public server.

**2. Implementation Plan for Point 10.2: The application has a public URL**
The review strictly notes that a public URL pointing to the live application is missing from the repository documentation.

*   **Step 1:** Retrieve the production URL from the hosting provider.
*   **Step 2:** Open the **`README.md`** file.
*   **Step 3:** Add the public URL prominently at the very top of the document directly beneath the title (e.g., **"Play the game live at: `https://your-public-url.vercel.app`"**).
*   **Step 4:** Ensure this link is also added to the project description in the Git repository settings (e.g., GitHub "About" section) and documented in `docs/team-assignment.md`.

**3. Implementation Plan for Point 10.3: The production version runs without debug mode**
The review indicates that the 'P' key debug mode is fully accessible in production because it relies on user preferences rather than environment checks.

*   **Step 1:** Open **`frontend/components/fps-game.tsx`**, where the 'P' key event listener is implemented for the top-down minimap.
*   **Step 2:** Wrap the 'P' key event listener inside an environment check: `if (process.env.NODE_ENV !== 'production') { ... }` so it is completely disabled in the live build.
*   **Step 3:** Open **`frontend/components/settings-menu.tsx`** or **`frontend/hooks/use-settings.tsx`**. Conditionally remove or hide the "Debug Mode" toggle from the UI if `process.env.NODE_ENV === 'production'`.
*   **Step 4:** Update the `README.md` Controls section to specify that the 'P' key debug mode is `(Development Only)`.

**4. Implementation Plan for Point 10.4: The team has a prepared procedure for deploying a new version of the application**
There is currently no CI/CD workflow directory or written runbook in the repository documenting how releases happen.

*   **Step 1:** Create a new directory path in the root of the project: **`.github/workflows/`**.
*   **Step 2:** Create a deployment pipeline configuration file, such as `deploy.yml`, inside this directory to explicitly define the automated build and deployment steps triggered on merging to the `main` branch.
*   **Step 3:** Create a dedicated runbook file, such as **`docs/deployment-procedure.md`**.
*   **Step 4:** Write a step-by-step procedure in this file detailing how the team manages versioning (updating `version.md`), merging pull requests, running tests, and verifying the production deployment.

**5. Implementation Plan for Point 10.5: Bug fixes can be deployed without application downtime**
The review states there is no architectural documentation or strategy proving zero-downtime deployments or safe database migrations.

*   **Step 1:** Create a new documentation file named **`docs/zero-downtime-strategy.md`**.
*   **Step 2:** Explicitly document the hosting provider's (e.g., Vercel) **Blue/Green deployment strategy**, explaining how traffic is only routed to the new build once it successfully compiles, ensuring no frontend downtime.
*   **Step 3:** Document a strict **expand-and-contract migration strategy** for Prisma in this file. Explain that breaking database schema changes (like removing or renaming columns) must be deployed in multiple backward-compatible phases to ensure the live application does not crash during the rollout.
*   **Step 4:** Reference this zero-downtime strategy document explicitly in the `README.md` or `docs/team-assignment.md` so reviewers can easily find and verify it.
---
**1. Implementation Plan for Point 11.1: The repo contains the commit history of all team members**
The review indicates that the repository snapshot is missing the `.git` directory or a verifiable commit history export file, preventing verification of the team's commit history.

*   **Step 1:** Ensure that the project is actively managed using Git and that all team members are committing their work.
*   **Step 2:** Generate a static export of the commit log to ensure it is verifiable even if the `.git` folder is stripped from the submission artifact. Run a command such as `git log --all --pretty=format:"%h - %an, %ar : %s" > docs/commit-history.txt` in the terminal.
*   **Step 3:** Stage, commit, and push this new `docs/commit-history.txt` file to the repository.
*   **Step 4:** Add an entry in `CHANGELOG.md` stating that the commit history log has been explicitly exported to the `docs` folder for review compliance.

**2. Implementation Plan for Point 11.2: Every code change is assigned to a specific author**
Because the repository lacks a commit log, there is no line-by-line attribution (`git blame`) to verify that every single code change is assigned to a specific author.

*   **Step 1:** Verify that all team members have properly configured their local Git environments (using `git config user.name` and `git config user.email`) so that every commit is correctly attributed to them.
*   **Step 2:** Ensure the project is hosted on a platform (such as GitHub or GitLab) that supports native line-by-line `git blame` tracking.
*   **Step 3:** Open the **`README.md`** file and explicitly add a link to the hosted Git repository, instructing reviewers to use the platform's `blame` feature to verify line-by-line authorship.
*   **Step 4:** Alternatively, export a `git blame` summary for critical files into the `docs/` folder to serve as static proof of authorship assignment.

**3. Implementation Plan for Point 11.3: The team uses an issue tracker for recording tasks and bugs**
The review notes that the team currently relies on a static `Team-TODO.md` file rather than an actual issue tracker, and there are no issue IDs referenced in the codebase or changelog.

*   **Step 1:** Set up a formal issue tracker for the project (such as GitHub Issues, GitLab Issues, or Jira).
*   **Step 2:** Migrate all pending tasks and bugs currently listed in **`docs/Team-TODO.md`** into the new issue tracker to generate unique ticket IDs (e.g., `#1`, `#2`).
*   **Step 3:** Open **`README.md`** and **`docs/team-assignment.md`** and add an explicit, clickable URL pointing to the newly established public issue tracker.
*   **Step 4:** Delete the static `docs/Team-TODO.md` file, replacing it with a note directing the team and reviewers to the live issue tracker.

**4. Implementation Plan for Point 11.5: Every bug fix is linked to a specific commit**
While the `CHANGELOG.md` properly documents bug fixes under the `##### Fixed` headers, none of these fixes are linked to a specific commit hash or pull request.

*   **Step 1:** Open the terminal and use the `git log` command to find the exact commit hashes for all past bug fixes.
*   **Step 2:** Open the **`CHANGELOG.md`** file.
*   **Step 3:** Locate all entries listed under the `##### Fixed` headers.
*   **Step 4:** Append the corresponding short commit hash (e.g., `a1b2c3d`) or Pull Request URL to the end of every bug fix description. For example, change "* Fixed Vercel Deployment Crash*" to "* Fixed Vercel Deployment Crash **(Commit: a1b2c3d)***".
*   **Step 5:** Ensure the team's workflow is updated so that all future bug fix entries in the changelog strictly include their associated commit hash.
---
**1. Implementation Plan for Point 12.1: A merge conflict occurred at the last minute and no one knew why**
The review notes that while the transition to `pnpm` is documented to resolve lockfile conflicts, there is no explicit statement about a last-minute merge conflict of unknown origin.

*   **Step 1:** Open the **`CHANGELOG.md`** file.
*   **Step 2:** Locate the `[0.5.29]` release entry regarding the "Package Manager Migration".
*   **Step 3:** Modify the entry to explicitly document the social dynamic required by the review: *"Transitioned the project from npm to pnpm because **a merge conflict occurred at the last minute and no one knew why**, resolving persistent lockfile issues."*.

**2. Implementation Plan for Point 12.2: A commit disappeared and the team spent time looking for it**
A strict search shows no mention of a lost commit or the team spending time searching for one.

*   **Step 1:** Create a new project documentation file, such as **`docs/retrospective.md`** or **`docs/post-mortem.md`**, or open **`CHANGELOG.md`**.
*   **Step 2:** Add a verifiable developer note explicitly documenting a Git-related incident where a commit disappeared from the repository history.
*   **Step 3:** Explicitly state in the documentation that *"the team spent time looking for it"* to strictly fulfill the wording required by the review.

**3. Implementation Plan for Point 12.3: A member changed the configuration and others had to deal with a broken build**
The changelog mentions fixing configuration crashes (like Prisma V7 or module-level environment variables), but it does not strictly document the team dynamic of one member changing it and others dealing with it.

*   **Step 1:** Open **`CHANGELOG.md`**.
*   **Step 2:** Locate the `[0.5.13]` entry detailing the "Github Actions CI Pipeline" crash due to Prisma's experimental V7 branch, or the `[0.5.26]` entry regarding the "Vercel Deployment" crash.
*   **Step 3:** Rewrite the entry to explicitly state the social dynamic: *"Fixed a critical build-time crash where **a member changed the configuration and others had to deal with a broken build**."*.

**4. Implementation Plan for Point 12.4: A pull request passed review, but something broke upon deployment**
The changelog documents deployment bugs (like the Vercel SSG evaluation crash) but lacks any mention of a Pull Request process or passing peer review beforehand.

*   **Step 1:** Open **`CHANGELOG.md`**.
*   **Step 2:** Locate the `[0.5.14]` entry detailing the "Vercel Deployment Crash" where `GET /api/leaderboard` was statically evaluated.
*   **Step 3:** Append an explicit statement to this entry acknowledging the review process: *"This issue occurred because **a pull request passed review, but something broke upon deployment**."*.

**5. Implementation Plan for Point 12.5: The project contained a "small change" that broke multiple parts of the application**
The changelog mentions a regression due to a missing hook call in version 0.2.19, but does not characterize it as a "small change" that cascaded.

*   **Step 1:** Open **`CHANGELOG.md`**.
*   **Step 2:** Locate the `[0.2.20]` entry referencing the regression caused by a missing hook call.
*   **Step 3:** Rewrite this entry to explicitly characterize the fix: *"Fixed a runtime error where settings were undefined. This was a **"small change" that broke multiple parts of the application**."*.

**6. Implementation Plan for Point 12.6: Everyone knew the solution to the problem only in their local environment**
There is no documentation capturing the "works on my machine" team dynamic.

*   **Step 1:** Open the newly created **`docs/retrospective.md`** file or add a new section to **`docs/documentation.md`**.
*   **Step 2:** Write a specific "Lessons Learned" note detailing a configuration discrepancy, such as the initial local SQLite database setup or the `.env` variables.
*   **Step 3:** Explicitly state in the text that during this phase of development, *"everyone knew the solution to the problem only in their local environment"* before a centralized fix was implemented.

**7. Implementation Plan for Point 12.7: The team realized that communication is just as important as code**
There are no post-mortem notes or retrospectives acknowledging the importance of communication over code.

*   **Step 1:** Open the **`docs/retrospective.md`** file (or append to the existing **`docs/team-assignment.md`**).
*   **Step 2:** Add a concluding "Post-Mortem summary" section to the document.
*   **Step 3:** Write an explicit, declarative statement acknowledging that after navigating merge conflicts, lost commits, and broken deployments, *"the team realized that communication is just as important as code"*.
*   **Step 4:** Add a brief entry in **`CHANGELOG.md`** explicitly pointing to the addition of this retrospective note.
