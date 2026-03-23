# Deployment Procedure

This runbook defines the standard procedure for the team to safely deploy a new version of INDUSTRIALIST to the production environment, minimizing the risk of downtime or live errors.

## 1. Version Bumping & Changelog
1. Update `version.md` to reflect the new SemVer semantic tag (e.g., `0.9.0`).
2. Update the `CHANGELOG.md` file, logging all specific bug fixes (along with their GitHub commit hashes) and newly developed features into their respective `Added`, `Changed`, `Fixed`, or `Removed` blocks.

## 2. Local Verification
Before opening a Pull Request into `main`:
1. Run `pnpm install` sequentially to ensure `pnpm-lock.yaml` is clean.
2. Run `pnpm run lint` and guarantee exactly zero ESLint violations.
3. Run `pnpm test` and ensure all Vitest API and Component suites pass.
4. If schemas changed, generate the new Prisma definitions locally and run `pnpm run build` to verify no breaking types.

## 3. Pull Request Initialization & CI Check
1. Push branch code and open a PR targeting the `main` branch.
2. Ensure the GitHub Actions CI Pipeline (`.github/workflows/deploy.yml`) finishes the `Lint Rules Check`, `Execute Tests`, and `Build Application Payload` phases cleanly.
3. Obtain peer approval from at least one authorized team member.

## 4. Production Release
1. Merge the Pull Request via the GitHub interface.
2. The merge event immediately triggers Vercel's native deployment workflow.
3. Vercel performs the Blue/Green compilation. Traffic remains fully pointing toward the old server version throughout compilation.
4. Once Vercel signifies *Success*, the Edge Network atomically re-routes player traffic to the newly built infrastructure.

## 5. Deployment Verification
1. Open the [Live URL](https://industrialist-game.vercel.app).
2. Look at the version tag in the Main Menu to verify the new build is serving.
3. Validate `/api/health` if applicable to ensure critical connections (Supabase) persisted post-build.
