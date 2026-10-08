# Review: `games/epaminondas/EpaminondasPositionalHeuristic.ts`

## Summary

Positional heuristic for Epaminondas. One informational finding.

---

## Findings

### 1. Magic-number score bounds hardcoded for default board dimensions

**Severity:** Informational

```typescript
const MAX_ADVANCEMENT_SCORE_TOTAL: number = 28 * width;          // 28 = 2 rows × 14 pieces (default)
const MAX_NUMBER_OF_ALIGNMENT: number = (24*16) + (4*15);        // default 14×12 board
```

`28` appears to be the default number of soldiers per player (2 rows × 14 columns). For custom configs with different `rowsOfSoldiers` or `height`, these bounds may be too small (causing `SCORE_BY_PIECE` to not properly dominate alignment scores) or too large (wasted headroom). The heuristic will still produce valid relative scores but its piece-then-alignment-then-advancement ordering guarantee may break for non-default configs.

---

## No Other Issues Found

- `avancement` is correctly defined: `height - coord.y` for ZERO (deeper = higher value) and `coord.y + 1` for ONE (lower row = higher value).
- Alignment counting correctly follows chains of same-player pieces in the three forward-facing ordinal directions.
- `SCORE_BY_PIECE` is correctly set larger than any possible alignment score total to ensure piece count dominates alignment count in the evaluation.
