# Review: `games/gipf/GipfRules.ts`

## Summary

Rules for Gipf. One cosmetic finding.

---

## Findings

### 1. `applyPlacement` uses `getPreviousOpponent()` to get the current player's piece — confusing name

**Severity:** Cosmetic

```typescript
let previousPiece: FourStatePiece = FourStatePiece.ofPlayer(state.getPreviousOpponent());
```

In a 2-player alternating game, `getPreviousOpponent()` returns "the opponent of the previous player", which is the **current** player. The code is correct (the current player places their own piece), but the method name reads as "the opponent from last turn", not "the current player". A clearer expression would be `FourStatePiece.ofPlayer(state.getCurrentPlayer())`.

---

## No Other Issues Found

- `applyPlacement` push loop is correct: places the current player's piece at `coord`, shifts all existing pieces one step in `direction` until EMPTY is displaced.
- `getCapturable` correctly collects pieces from `start` to `end` (inclusive via the second forward loop) and extends the capture in both directions to include all adjacent non-empty pieces.
- `getLinePortionWithFourPiecesOfPlayer` returns on the first group of exactly 4; `getCapturable` then extends to include the 5th+ piece in longer runs, so the early return is correct.
- `isLegal` correctly validates: initial captures → no-more-captures → placement → final captures → no-more-captures.
- `getPlayerScore` correctly returns `MGPOptional.empty()` only when a player has 0 pieces AND no captures are possible (the only losing condition).
