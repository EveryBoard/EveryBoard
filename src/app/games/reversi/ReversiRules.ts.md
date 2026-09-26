# Review: `games/reversi/ReversiRules.ts`

## Summary

Rules for Reversi. One missing validation bug found, plus one dead-code note.

---

## Findings

### 1. `isLegal` does not check non-pass moves are on board before `getPieceAt`

**Severity:** Medium

```typescript
if (state.getPieceAt(move.coord).isPlayer()) {
    return MGPFallible.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SPACE());
}
```

`ReversiMove.encoder` accepts arbitrary coordinates, and `ReversiMove.PASS` is represented by `(-1, -1)`. Any other out-of-range coordinate, such as `(-1, 0)` or `(width, 0)`, reaches `state.getPieceAt(move.coord)`, whose implementation asserts that the coord is on board. That turns a malformed move into an assertion throw instead of a clean legality failure.

Other placement rules such as `PenteRules.isLegal` explicitly return `CoordFailure.OUT_OF_RANGE(move.coord)` before reading the board. Reversi should do the same for all non-pass moves.

---

## Notes

### `nextBoard` updates in `getListMoves` are dead code

```typescript
let nextBoard: PlayerOrNone[][];
// ...
nextBoard = state.getCopiedBoard();
// ...
for (const switched of result) {
    nextBoard[switched.y][switched.x] = player;  // unused
}
nextBoard[coord.y][coord.x] = player;           // unused
moves.push(new ReversiMoveWithSwitched(move, result.length));
```

`nextBoard` is assigned and modified but never read again; the move only stores the switch count, not the board. These writes are leftover from a refactor and can be removed.

---

## No Other Issues Found

- `getInitialState`: places center 2×2 as Z/O diagonal pairs (standard Reversi setup). ✓
- `applyLegalMove`: flips all `info` coords then places player's piece at move coord; PASS just increments turn. ✓
- `getAllSwitcheds`: iterates all 8 ordinals, enters `getSandwicheds` only when first neighbor is opponent. ✓
- `getSandwicheds`: walks in direction, accumulates opponent pieces, returns them when capturer found; returns [] on empty or off-board. ✓
- `playerCanOnlyPass`: checks that `getListMoves` returns exactly 1 move which is PASS. ✓
- `nextPlayerCantOnlyPass`: creates next-turn state with same board (turn+1) and checks if that player also can only pass. ✓
- `isGameEnded`: both players unable to move → game over. ✓
- `getGameStatus`: score difference determines winner; tied scores = DRAW. ✓
- `isLegal`: PASS only legal when `playerCanOnlyPass`; placement requires at least one flip. ✓
- Config min=3: initial 4-piece center requires at least 2 center rows/cols → width/height ≥ 3 ensures center coords are valid. ✓
