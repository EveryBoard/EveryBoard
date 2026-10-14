# Review: `games/kamisado/KamisadoMoveGenerator.ts`

## Summary

Move generator for Kamisado. One medium bug: potential out-of-bounds crash when scanning for moves.

---

## Findings

### 1. `getListMovesFromNonBlockedState` can crash on out-of-bounds coord access

**Severity:** Medium

```typescript
for (let stepSize: number = 1; stepSize < KamisadoBoard.SIZE; stepSize++) {
    const endCoord: Coord = startCoord.getNext(dir, stepSize);
    if (state.isEmptyAt(endCoord)) {   // crashes if endCoord.y < 0 or >= 8
        ...
    } else {
        break;
    }
}
```

`state.isEmptyAt(endCoord)` calls `board[coord.y][coord.x]`. If `coord.y` is negative or ≥ 8, `board[coord.y]` is `undefined` and the property access throws a `TypeError`.

This happens when a piece has advanced far toward the goal. For example, a Player.ZERO piece at row 1 moving UP (direction y=-1): step 1 reaches row 0 (valid), step 2 reaches row -1 — `board[-1]` is `undefined`, crash.

The loop iterates `stepSize` from 1 to `KamisadoBoard.SIZE - 1` (= 7), and only an occupied cell or out-of-bounds can stop it. If the path from row 1 to the top edge is unobstructed, the generator does not stop at the boundary.

Fix: add a bounds check before `isEmptyAt`:

```typescript
if (state.isNotOnBoard(endCoord)) break;
if (state.isEmptyAt(endCoord)) { ... }
```

---

## No Other Issues Found

- `Utils.assert(state.alreadyPassed === false, ...)` in the pass path is correct: if both players passed, `getGameStatus` declares the game over before the move generator is consulted.
- Sorting by descending distance is a reasonable heuristic (prefer longer moves for AI ordering).
- `getListMovesFromNonBlockedState` correctly breaks the step loop when a blocking piece is encountered (pieces cannot jump over others in Kamisado).
