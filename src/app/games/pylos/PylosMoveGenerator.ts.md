# Review: `games/pylos/PylosMoveGenerator.ts`

## Summary

Move generator for Pylos. One medium finding: no-capture moves are omitted when capture is possible.

---

## Findings

### 1. No-capture moves excluded when `canCapture` is true

**Severity:** Medium (AI quality)

```typescript
if (PylosRules.canCapture(postMoveState, move.landingCoord)) {
    possibleCaptures = PylosRules.getPossibleCaptures(postMoveState);
} else {
    result.push(move);  // only added when capture is NOT possible
}
```

When `canCapture` returns `true`, only capture moves are added. The uncaptured version of the move (which `isLegalCaptures` accepts because `firstCapture.isAbsent()` returns success) is never generated. In standard Pylos, capturing is optional — the player may choose not to capture even when forming a 2x2 square. The AI always captures when possible, potentially missing stronger no-capture lines. Fix: add `result.push(move)` before the for-loop to include the no-capture option.

---

## No Other Issues Found

- `applyLegalMove(move, false)` correctly uses `increment=false` so `getCurrentPlayer()` and `canCapture` see the right player. ✓
- `getPossibleCaptures` is called on `postMoveState` (piece already placed). ✓
