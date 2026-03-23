# Zero-Downtime Deployment Strategy

INDUSTRIALIST leverages high-availability cloud strategies ensuring that our players face 0% downtime and uninterrupted game progression, even during major software releases and database overhauls.

## Code Deployments: Blue/Green Strategy
When new application code is merged into the `main` branch, our hosting provider (Vercel) automatically initiates a completely isolated (Blue) build process. 
- The live production cluster (Green) continues handling 100% of player traffic normally.
- Once the Blue server build completely bundles, initiates Prisma clients, and passes internal health evaluations, the network router atomically flips all domains and traffic pipes to the Blue server.
- The player experiences an instantaneous update. If the new build crashes during construction, the flip aborts entirely, avoiding 500 errors.

## Database Deployments: Expand and Contract Migrations
Changing the database schema (via Prisma) carries heavy risks for active players saving their games in real time. We strictly mandate an **Expand-and-Contract Migration** protocol for any breaking change.

### Example: Renaming or Deleting a Column
If the `credits` column in the `User` table needs to be renamed to `bankBalance`, we absolutely **never** execute an atomic rename that drops or invalidates the old column abruptly.

**Phase 1: Expand (Release X.0.0)**
- Add the new column `bankBalance` to Prisma. Do not delete `credits`.
- Deploy the app. The API code is updated to write incoming data to **both** `bankBalance` and `credits`, and reads from `bankBalance` (falling back to `credits` if empty).
- The live app safely functions.

**Phase 2: Migrate Data (Background Script)**
- Run an asynchronous database task syncing historical `credits` values fully into `bankBalance`.

**Phase 3: Contract (Release X.0.1)**
- Safely drop the `credits` column from the Prisma schema entirely since the codebase natively points to `bankBalance`. Players retain 100% integrity without service interruption.
