# Concurrent Users Load Test

## Tool
[Artillery](https://www.artillery.io/) - a modern load testing toolkit.

## Configuration
The load test configuration is at `frontend/scripts/load-test.yml`.

### Test Phases
1. **Warm-up** (30s): 5 virtual users/second
2. **Sustained load** (60s): 20 virtual users/second
3. **Peak load** (30s): 50 virtual users/second

### Scenarios Tested
- **Leaderboard access**: GET `/api/leaderboard` — simulates players checking scores
- **Authentication flow**: POST `/api/auth/login` — simulates concurrent login attempts

## How to Run
1. Start the production server: `pnpm build && pnpm start`
2. In a separate terminal: `pnpm test:load`
3. Artillery will output metrics including latency percentiles, RPS, and error rates.

## Expected Metrics
- p95 latency < 500ms under sustained load
- Error rate < 1% under sustained load
- Server remains responsive during peak load
