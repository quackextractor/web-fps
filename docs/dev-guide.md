Here is the step-by-step guide to executing the implementation plans smoothly:

### 1. Centralize Task Tracking Before Coding
Before anyone writes a line of code, you must migrate away from static markdown lists and establish a live tracking system.
*   **Set up the Board:** Move all tasks from `Team-TODO.md` and the implementation plans into a formal issue tracker like GitHub Issues or Jira.
*   **Assign & Status:** Each task must have a brief description, an assigned author (matching our distributed task board), and a strict status of "planned," "in progress," or "done". **Work must only be done on these predefined tasks**.
*   **Generate IDs:** This process will generate unique IDs (e.g., `#12`) for every task, which is a strict requirement for passing the repository evaluation.

### 2. Domain-Isolated Branching Strategy
Because the workload has been divided by expertise, you have a natural advantage: team members will mostly be working in completely different folders. 
*   **Isolate Work:** Dominik will primarily work in `frontend/app/api/` and `prisma/schema.prisma`. Tobiáš will work in `frontend/components/game-ui/` and `styles/globals.css`. Pavlo will work in `frontend/lib/fps-engine.ts` and `public/textures/`. 
*   **Feature Branches:** Developers must create dedicated feature branches off the `main` branch for their specific tasks (e.g., `feature/ui-lazy-loading` or `fix/api-validation`).
*   **Never Push Directly to Main:** All work must go through Pull Requests (PRs) to ensure continuous, non-conflicting integration. 

### 3. Strict Commits and Traceable Authorship
The project evaluation explicitly requires that every code change is assigned to a specific author and that the Git commit history is exportable.
*   **Configure Local Git:** Every member must verify their local Git environment is configured with their correct `user.name` and `user.email` so authorship is accurately tracked by `git blame`.
*   **Link Commits to Issues:** Every commit message that fixes a bug or completes a task must explicitly reference the issue ID generated in Step 1 (e.g., `"Fixed API Save Vulnerability (Fixes #12)"`). You must also append the specific commit hash to the `CHANGELOG.md` entry.

### 4. Pre-Merge Validation (Preventing Broken Builds)
To prevent the scenario where "a pull request passed review, but something broke upon deployment", you must run local checks before opening a PR.
*   **Run Linters:** Enforce strict TypeScript compliance and run `pnpm run lint` across all new UI and API additions before merging.
*   **Run Tests:** Execute `pnpm test` locally to ensure no existing logic was broken. 
*   **Peer Review:** Require at least one other team member to approve the Pull Request. Miro, as the Team Leader, should oversee the merging sequence.

### 5. Managing the "Conflict Zones" (Shared Files)
While most code is isolated, there are three major "bottleneck" files where merge conflicts are highly likely to occur. **You must coordinate changes to these files in the team chat.**

*   **`CHANGELOG.md`:** Everyone is required to log their work here with an `[Author: Name]` tag and date. *Strategy:* Add your changelog updates as the absolute final step before hitting "Merge" on your PR, or assign Tobiáš (who is writing the Team Scrapes texts) to consolidate everyone's notes at the end of the day.
*   **`frontend/package.json` & `pnpm-lock.yaml`:** Filip is tasked with running `depcheck` to remove unused libraries, while Tobiáš is adding `DOMPurify` and Dominik is utilizing `Zod`. *Strategy:* Filip must do the dependency purge **first**. Once merged, everyone else must run `pnpm install` locally to pull the updated `pnpm-lock.yaml` file before adding their new libraries. This prevents the "last minute lockfile conflict" the team previously suffered.
*   **`frontend/next.config.mjs`:** Miro needs to add Vercel CDN caching and `assetPrefix`, Filip needs to enforce GZIP compression, and Tobiáš/Pavlo need to re-enable image optimization. *Strategy:* Have Miro apply all Next.js configuration modifications in one single PR, as his tasks are mostly administrative copy-pasting, rather than having three people edit the config file simultaneously.

### 6. Communicate Configuration Changes
The checklist specifically tests if the team experienced a situation where "a member changed the configuration and others had to deal with a broken build" or "everyone knew the solution only in their local environment". 
*   When Dominik sets up the new `.env.production.example` file with Supabase URLs, or when Miro alters the Vercel Edge caching headers, they must immediately notify the team so everyone can update their local `.env` files. 
*   As the project retrospective notes dictate, the team must realize that **"communication is just as important as code."**.