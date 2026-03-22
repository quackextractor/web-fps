# Server Performance Benchmark

## Methodology

Server performance was benchmarked using [Artillery](https://www.artillery.io/) against a local Next.js production build.

### Test Configuration
- **Duration**: 60 seconds
- **Arrival Rate**: 10 virtual users/second
- **Total Requests**: ~600

### Scenarios
| Scenario | Weight | Endpoint | Method |
|----------|--------|----------|--------|
| Leaderboard Read | 60% | `/api/leaderboard` | GET |
| Auth Write | 40% | `/api/auth/login` | POST |

## How to Run

```bash
cd frontend
pnpm build && pnpm start
# In another terminal:
pnpm test:perf
```

## Key Metrics to Monitor
- **Average Latency**: Target < 100ms for reads, < 200ms for writes
- **Requests Per Second (RPS)**: Expected ~10 RPS sustained
- **Error Rate**: Target 0% under baseline load
- **p95/p99 Latency**: Identifies tail latency issues

## Notes
- Results will vary based on hardware. Run on a consistent environment for comparable results.
- The performance test script is located at `frontend/scripts/perf-test.yml`.
