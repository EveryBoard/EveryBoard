# Review: `games/quebec-castles/quebec-castles.component.ts`

## Summary

Component for Quebec Castles. One medium bug: `cancelMoveAttempt` doesn't reset `constructedState`. One cosmetic naming issue.

---

## Findings

### 1. `cancelMoveAttempt` doesn't reset `constructedState`

**Severity:** Medium

```typescript
public override cancelMoveAttempt(): void {
    this.dropped = new Set();
    this.possibleLanding = new Set();
    this.selected = MGPOptional.empty();
    // missing: this.constructedState = this.getState();
}
```

During multi-drop phase, the user can add pieces to `constructedState` by clicking valid coords. If the move is cancelled (via `cancelMoveAttempt`), `dropped` is cleared but `constructedState` retains the tentatively placed pieces. On the next interaction:
- `getNumberOfAwaitedDrop()` = `totalPieceToDrop - constructedState.countPieceOnBoard(player)` returns a value that's too small (stale extra pieces in `constructedState`)
- The `0 < this.getNumberOfAwaitedDrop()` guard in `onDrop` prevents adding new pieces prematurely
- Visually, pieces appear on the board even though `dropped` is empty

Fix: add `this.constructedState = this.getState();` to `cancelMoveAttempt`.

---

## Notes

### Variable named `rotationInRadius` should be `rotationInRadians`

```typescript
const rotationInRadius: number = -45 * Math.PI / 180;
```

The variable holds radians, not a radius. Should be `rotationInRadians`.

---

## No Other Issues Found

- `getViewBox` expands for drop phase via `isPlayerDropping()` which checks `isDroppingGroup`. ✓
- `getBasicViewBox` rhombic path: rotates all four corners around center, then derives minX/maxX/minY/maxY from rotated bounds. ✓
- `getRotated` implements standard 2D rotation formula correctly: `x' = cx + cos(θ)(x-cx) + sin(θ)(y-cy)`, `y' = cy - sin(θ)(x-cx) + cos(θ)(y-cy)`. Note: the y formula uses `-sin` and `+cos` which is correct for screen coordinates (y-down). ✓
- `onClick` early-exit when drop phase and `getNumberOfAwaitedDrop() === 0`: only allows un-selecting already-dropped coord; silently ignores clicks on new coords. ✓
- `onDrop` multi-piece: `0 < this.getNumberOfAwaitedDrop()` prevents exceeding the piece quota. ✓
- `selectedCoord` calls `getPossibleMovesFor` on `this.getState()` (not constructedState), which are identical in the normal phase after `updateBoard`. ✓
- `validateGroupDrop` uses `dropped.toList()` which preserves insertion order; legal validation in rules handles any ordering. ✓
- `getGroupValidatorTransform`: ZERO (Defender/bottom) placed at lowerCorner, ONE (Invader/top) at upperCorner. ✓
- `getRemainingCy`: ZERO below board (`unextendedHeight + 0.5*SPACE`), ONE above board (`minY - 0.5*SPACE`). ✓
- `isPlayerCastle` reads from `this.getState().castles` (not constructedState), which is the committed state. ✓
