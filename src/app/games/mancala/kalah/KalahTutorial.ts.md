# Review: `games/mancala/kalah/KalahTutorial.ts`

## Summary

Tutorial for Kalah. One medium bug in the "End of the game" step.

---

## Findings

### 1. "End of the game" step results in a DRAW, not a win

**Severity:** Medium

```typescript
new MancalaState([
    [0, 0, 0, 0, 2, 0],  // row 0: ONE's side
    [2, 0, 0, 0, 0, 1],  // row 1: ZERO's side
], 0, PlayerNumberMap.of(19, 24)),
[MancalaMove.of(MancalaDistribution.of(5))],
```

Total seeds on board = 5. ZERO starts with 19. `halfOfTotalSeeds = 6 × 4 = 24`. For ZERO to win, ZERO needs > 24 seeds, i.e., 19 + captured > 24, i.e., captured > 5. But only 5 seeds remain on the board. The expected move (`x=5`, 1 seed) captures the column at x=4 (3 seeds total) then triggers a monsoon (ONE's row is empty, ZERO takes the remaining 2 seeds from ZERO's row), totaling 19 + 3 + 2 = 24 — equal to `halfOfTotalSeeds`, which produces `GameStatus.DRAW`, not `GameStatus.ZERO_WON`. The success message "Congratulations, you won!" is incorrect.

Fix: increase ZERO's starting score to 20 (so 20 + 5 = 25 > 24) or adjust the board to provide 6+ capturable seeds.

---

## Notes

### "The Kalah (1/2)" success message may not match all accepted moves

The step accepts moves x=0, x=1, and x=2, but the success message "three houses have been fed in addition to your Kalah" is only accurate for x=0 (which feeds exactly 3 opponent houses after the Kalah). Moves x=1 and x=2 feed fewer opponent houses. Minor cosmetic inconsistency.

---

## No Other Issues Found

- "The Kalah (2/2)" predicate correctly checks `move.distributions.length === 1` to fail single-distribution moves — any 2-distribution move where first ends in store passes. ✓
- "Captures" predicate checks `resultingState.getPieceAtXY(1, 0) === 0` — correctly verifies the column-1 house on row 0 was captured. The expected 3-distribution move (x=1 → store, x=0 → store, x=3 → captures (1,1) and (1,0)) is valid. ✓
