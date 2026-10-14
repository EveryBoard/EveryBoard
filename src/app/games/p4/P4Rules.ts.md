# Review: `games/p4/P4Rules.ts`

## Summary

Rules for P4 (Four in a Row). One medium finding: missing bounds check on column index.

---

## Findings

### 1. `isLegal` does not check `move.x < state.getWidth()`

**Severity:** Medium

```typescript
public override isLegal(move: P4Move, state: P4State): MGPValidation {
    if (state.getPieceAtXY(move.x, 0).isPlayer()) {
        return MGPValidation.failure(P4Failure.COLUMN_IS_FULL());
    }
    return MGPValidation.SUCCESS;
}
```

`P4Move.of` asserts `x >= 0` but does not enforce `x < width`. If a replay/network delivers a move with `x >= config.width`, `getPieceAtXY(x, 0)` may access an out-of-bounds index, returning an unexpected value or crashing. A simple check `if (move.x >= state.getWidth()) return MGPValidation.failure(...)` would fix this.

---

## Notes

### `applyLegalMove` calls `P4Rules.get().getLowestUnoccupiedSpace` instead of `this.getLowestUnoccupiedSpace`

```typescript
const y: number = P4Rules.get().getLowestUnoccupiedSpace(board, x);
```

Cosmetic: calls the singleton via `P4Rules.get()` instead of `this`. Since the rules object is a singleton, both resolve to the same instance, but `this.getLowestUnoccupiedSpace(board, x)` would be clearer.

---

## No Other Issues Found

- `getLowestUnoccupiedSpace` correctly scans from row 0 downward and returns `y-1` — the lowest empty row. ✓
- `getGameStatus` correctly uses `getCurrentOpponent()` (the player who just moved) to identify the winner. ✓
- Draw detection uses `state.turn === width * height` — correct when all cells are filled. ✓
- `P4_HELPER` uses `NInARowHelper` with `Utils.identity` (piece-as-identity) and length 4. ✓
