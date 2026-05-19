# Review: `jscaip/state/FourStatePieceGameStateWithTable.ts`

## Summary
Clean and correct. The `as Player` cast in `getPlayerCoordsAndContent` is safe because the prior `isPlayer()` filter guarantees the piece is a `Player`.

---

## Findings

### 1. `getPlayerCoordsAndContent` is not abstract — subclasses cannot be forced to call it

**Severity:** Informational

The class is concrete (not abstract) and is intended for subclassing. If a subclass overrides `getCoordsAndContents()` without keeping the `FourStatePiece.UNREACHABLE` contract, `getPlayerCoordsAndContent` could behave incorrectly. The `isOnBoard` override correctly filters `UNREACHABLE` cells, so `getCoordsAndContents` (which calls `isOnBoard`) will also exclude them. This chain is correct but relies on the override not being bypassed.

---

## No Other Issues Found

- `isOnBoard` override correctly excludes `FourStatePiece.UNREACHABLE` cells.
- `hasPieceBelongingTo` and `coordIsOccupiedSquare` safely use `getOptionalPieceAt`.
- `isPlayerAt` uses `getPieceAt`, which asserts `isOnBoard` — callers must ensure the coord is on the board.
