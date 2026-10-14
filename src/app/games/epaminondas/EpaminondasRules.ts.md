# Review: `games/epaminondas/EpaminondasRules.ts`

## Summary

Rules for Epaminondas. One medium finding.

---

## Findings

### 1. `getLandingStatus` writes to `newBoard` before the bounds check

**Severity:** Medium

```typescript
while (landingIndex + 1 < move.stepSize) {
    newBoard[emptied.y][emptied.x] = PlayerOrNone.NONE;
    newBoard[landingCoord.y][landingCoord.x] = currentPlayer;  // written before bounds check
    if (state.isNotOnBoard(landingCoord)) {
        return MGPFallible.failure(EpaminondasFailure.PHALANX_IS_LEAVING_BOARD());
    }
    ...
```

If `landingCoord` is off the board (e.g., a phalanx against the far edge with `stepSize >= 2`), the array access `newBoard[landingCoord.y][landingCoord.x]` evaluates `newBoard[outOfRange.y]` first, which is `undefined`, and then `undefined[x] = currentPlayer` throws a `TypeError` at runtime.

The fix is to perform the bounds check BEFORE writing:

```typescript
if (state.isNotOnBoard(landingCoord)) {
    return MGPFallible.failure(EpaminondasFailure.PHALANX_IS_LEAVING_BOARD());
}
if (state.getPieceAt(landingCoord).isPlayer()) {
    return MGPFallible.failure(EpaminondasFailure.SOMETHING_IN_PHALANX_WAY());
}
newBoard[emptied.y][emptied.x] = PlayerOrNone.NONE;
newBoard[landingCoord.y][landingCoord.x] = currentPlayer;
```

In practice the move generator may avoid generating such moves, but the rules layer should not crash on them.

---

## No Other Issues Found

- `getGameStatus` correctly implements a **start-of-turn** victory check: `turn % 2 === 0` means ZERO is about to move, so the check for ZERO's winning advantage is appropriate here (i.e., ONE's prior move left ZERO ahead).
- `getCaptureValidity` correctly avoids double-clearing the first captured piece: it is overwritten by `getLandingStatus` placing the advancing phalanx's front piece; only subsequent captured soldiers need explicit `NONE`.
- `getPhalanxValidity` correctly iterates all `phalanxSize` cells and ensures none is empty or owned by the opponent.
- `applyLegalMove` safely passes the already-computed new board as `EpaminondasLegalityInformation`.
