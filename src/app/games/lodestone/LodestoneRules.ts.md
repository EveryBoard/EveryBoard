# Review: `games/lodestone/LodestoneRules.ts`

## Summary

Rules for Lodestone. One missing validation bug found.

---

## Findings

### 1. `isTargetLegal` reads the target coord without checking board bounds

**Severity:** Medium

```typescript
public isTargetLegal(state: LodestoneState, coord: Coord): MGPValidation {
    const targetContent: LodestonePiece = state.getPieceAt(coord);
    ...
}
```

`LodestoneMove` can be constructed or decoded with an out-of-range coord. `isLegal` calls `isLegalWithoutCaptures`, which calls `isTargetLegal`, and `state.getPieceAt(coord)` asserts if the coord is outside the board. The rules layer therefore throws instead of returning a validation failure for malformed target coordinates.

The method should check `state.isNotOnBoard(coord)` and return a coordinate/rules failure before reading the board.

---

## Notes

- `applyPull` correctly iterates outward from the lodestone, checking the ORIGINAL state for ownership (safe because pieces only move inward — positions being checked ahead of the iteration haven't been touched).
- `applyPush` starts at `lodestone + SIZE*direction` (may be off-board), then decrements toward the lodestone. Off-board positions correctly return `false` from `coordIsOwnedBy`, so no invalid board access occurs.
- `isLegal` correctly requires `numberOfCapturesInMove === min(actual_captures, remaining_spaces)` — all captures that fit must be placed.
- `updatePressurePlate` correctly uses `getCrumbledPlates().length` to determine how many plate rows to mark as UNREACHABLE.
- `getGameStatus` correctly handles draw (both players have 0 pieces) vs. victory and ongoing.
