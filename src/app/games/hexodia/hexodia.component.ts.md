# Review: `games/hexodia/hexodia.component.ts`

## Summary

Hexodia component handling multi-drop moves. One cosmetic finding.

---

## Findings

### 1. `onClick` does not guard against clicks on UNREACHABLE cells

**Severity:** Cosmetic

```typescript
if (this.getState().getPieceAt(clickedCoord).isPlayer()) {
    return this.cancelMove(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
} else if (this.droppedCoords.some((c: Coord) => c.equals(clickedCoord))) {
    return this.cancelMove();
} else {
    this.droppedCoords = this.droppedCoords.concat(clickedCoord);
```

`FourStatePiece.UNREACHABLE.isPlayer()` returns `false`, so clicking an UNREACHABLE cell (if the template somehow exposes one) would silently add it to `droppedCoords`. In practice the template likely only renders clickable targets for EMPTY cells (guarded by `isReachable`), so this is not exploitable via normal UI interaction. The underlying `isLegalDrop` also has the same gap (noted separately in `HexodiaRules.ts.md`).

---

## No Other Issues Found

- Multi-drop accumulation (`droppedCoords`) is correctly cleared in `cancelMoveAttempt`.
- Turn-0 single-drop path correctly bypasses the `totalDrop` accumulation loop.
- `droppedCoords` is not reset in `updateBoard`, relying on the base class to call `cancelMoveAttempt` on move completion, which is the correct pattern.
- Clicking an already-selected coord silently resets (calls `cancelMove()` with no message) — intentional deselect behavior.
