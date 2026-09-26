# Review: `games/mancala/common/MancalaRules.ts`

## Summary

Base rules for all Mancala variants. Two cleanup issues found in `distributeMove`; neither appears to affect current rules because `passedByStoreNTimes` is not used by callers for scoring or bonus-turn decisions.

---

## Findings

### 1. `distributeMove`: `passedByStoreNTimes` self-doubles instead of accumulating

**Severity:** Low

```typescript
// line 178
distributionResult.passedByStoreNTimes += distributionResult.passedByStoreNTimes;
```

`x += x` is equivalent to `x = 2 * x`, doubling the value from the current lap rather than accumulating across laps. When `continueLapUntilCaptureOrEmptyHouse` is active and the while-loop runs multiple times, only the doubled value of the last lap is kept. Even for a single-lap distribution, the returned `passedByStoreNTimes` is 2x the actual store count.

Current callers only use `endsUpInStore`; `passedByStoreNTimes` is not read outside this method except by the dead `captures` code below. This is therefore a real internal accounting bug, but not currently an exposed rules bug.

Fix: use a separate accumulator variable:
```typescript
let totalPassedByStore: number = 0;
// inside while loop:
totalPassedByStore += distributionResult.passedByStoreNTimes;
// in the return:
passedByStoreNTimes: totalPassedByStore,
```

### 2. `distributeMove`: dead `captures` variable

**Severity:** Cosmetic

```typescript
// lines 175-176
const captures: PlayerNumberMap = distributionResult.resultingState.getScoresCopy();
captures.add(player, distributionResult.passedByStoreNTimes);
```

`captures` is computed but immediately discarded; it is never used to update `distributionResult.resultingState` or the return value. Store seeds are already credited in `distributeHouse` through `resultingState.feedStore(player)`, so this code is dead and harmless.

---

## No Other Issues Found

- `getGameStatus` correctly uses `halfOfTotalSeeds = width * seedsByHouse` as the majority threshold. Draw is correctly detected when both players have exactly half. ✓
- `isStarving` correctly iterates the player's row using `player.getOpponent().getValue()` (same convention as `MancalaState.getCurrentPlayerY`). ✓
- `distributeHouse` correctly skips the starting house when `!config.feedOriginalHouse`. ✓
- `getNextCoord` correctly encodes the clockwise traversal: row 0 left→right, row 1 right→left, with optional store intercept for Kalah. ✓
- `monsoon` correctly sweeps all remaining seeds to the monsooning player. ✓
- `sharedMonsoon` uses `Math.floor` for odd seeds — one seed may be lost, but with standard even-total mancala games this is never reached. ✓
- `mustMonsoon` correctly distinguishes between `mustFeed` (opponent takes remaining) and non-mustFeed (starving player's opponent takes remaining). ✓
