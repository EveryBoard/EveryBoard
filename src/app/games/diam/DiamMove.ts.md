# Review: `games/diam/DiamMove.ts`

## Summary
Move types for Diam (drop and circular shift). One missing issue found: decoded moves can carry invalid board coordinates into rules code.

---

## Findings

### 1. Decoded moves are not range-checked before rules access the board

**Severity:** Medium

`DiamMoveDrop.encoder` decodes with `new DiamMoveDrop(fields[0], fields[1])`, and the constructor only rejects empty pieces. `DiamMoveShift.encoder` similarly decodes with `new DiamMoveShift(fields[0], ...)` without checking the shift start is on the 8x4 board.

`DiamRules.isDropLegal` only asserts `drop.target < DiamState.WIDTH`, so negative targets can reach `state.getStackHeight(drop.target)`. `DiamRules.isShiftLegal` immediately calls `state.getPieceAt(shift.start)`. Malformed replay/network moves can therefore throw or read invalid board cells instead of returning a validation failure.

---

## Notes

- `DiamMoveDrop` constructor correctly rejects `DiamPiece.EMPTY` by throwing.
- `getTarget()` for shift correctly wraps around the 8-column ring using modular arithmetic.
