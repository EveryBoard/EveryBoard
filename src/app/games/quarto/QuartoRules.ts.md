# Review: `games/quarto/QuartoRules.ts`

## Summary

Rules for Quarto. One missing validation bug found, plus some naming confusion noted.

---

## Findings

### 1. `isLegal` indexes `board[y][x]` without checking move coord bounds

**Severity:** Medium

```typescript
const x: number = move.coord.x;
const y: number = move.coord.y;
const board: QuartoPiece[][] = state.getCopiedBoard();
if (this.isOccupied(board[y][x])) {
    return MGPValidation.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
}
```

`QuartoMove` does not validate its coordinate in the constructor or encoder. A malformed move with `y < 0`, `y >= 4`, `x < 0`, or `x >= 4` can therefore make `board[y]` undefined or read outside the row, causing a runtime exception before the rules return a validation failure.

The method should check `state.isNotOnBoard(move.coord)` and return `CoordFailure.OUT_OF_RANGE(move.coord)` before indexing the board.

---

## Notes

### Confusing variable naming in `getGameStatus`

```typescript
const opponent: Player = state.getCurrentPlayer(); // = the player who did NOT just move
const player: Player = opponent.getOpponent();      // = the player who DID just move
```

After a move is applied and turn increments, `getCurrentPlayer()` is the NEXT player (who did not move). Named `opponent` because they "opposed" the mover. `player` is the actual mover. This is counterintuitive but correct: with equal configs, `isOnlyPlayerVictory` always returns `false` (both levels match), so `playerMadeAVictory` fires and the mover (`player`) wins. For asymmetric configs, the level check gates whether the mover or the non-mover gets the win.

### `isPatternVictorious` re-reads initialCoord twice

In `isPatternVictorious`, `initialCoord` is read before the loop, and `pattern.getCoords()` includes `initialCoord` as its first element (offset (0,0) + initialCoord). This causes `initialCoord` to be read and merged with itself on the first iteration — a harmless no-op.

---

## No Other Issues Found

- `QuartoCriterion.mergeWith`: correctly nullifies sub-criteria where pieces differ; returns true if any remain. ✓
- `isLegal`: allows `EMPTY` piece on turn 15 (last move, no piece to give). Validates occupied square, board-placed piece, piece-in-hand exclusion. ✓
- `getAllPatterns` for ascending diagonal correctly filters to `x <= maxX && minY=3 <= y <= maxY=height-1`. On 4×4 board, only coord (0,3) passes → one ascending diagonal. ✓
- `getPatternInfos`: early return on second empty square is correct (≥2 empty = no pre-victory). ✓
- `searchForVictoryOrPreVictoryInPattern`: mutates `boardStatus` in-place for sensitive squares — consistent with the returned reference. ✓
