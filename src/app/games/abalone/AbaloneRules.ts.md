# Review: `games/abalone/AbaloneRules.ts`

## Summary
Abalone game rules implementation. Two issues found.

---

## Findings

### 1. `isLegalPush` sets `newBoard[move.coord.y][move.coord.x] = empty` before completing legality check

**Severity:** Medium

```typescript
const newBoard: FourStatePiece[][] = state.getCopiedBoard();
newBoard[move.coord.y][move.coord.x] = empty;
while (pieces <= config.maximumPushingGroupSize && ...) { ... }
if (pieces > config.maximumPushingGroupSize) {
    return MGPFallible.failure(...);
}
```

The first piece's cell is cleared (`= empty`) before verifying whether the push is actually legal. If the move is illegal (e.g., too many pieces in the group), the function returns a `failure` — but `newBoard` is a mutable copy that was prematurely modified. Since `newBoard` is local and not exposed on failure paths, this doesn't cause state corruption. However, the board passed to `isLegalRealPush` already has the first cell emptied, which is intentional for the resulting state. The ordering is correct but confusingly ordered — comment would help.

---

### 2. `getGameStatus` uses `<=` comparison — wins when opponent has `nbToCapture` or more captures

**Severity:** Informational

```typescript
if (nbToCapture <= scores.get(Player.ZERO)) {
    return GameStatus.ZERO_WON;
```

`scores.get(Player.ZERO)` is the number of Player.ONE's pieces that Player.ZERO has captured (i.e., pushed off). The condition `nbToCapture <= scores.get(Player.ZERO)` is correct — player zero wins when captures reach or exceed the required number. However, since captures strictly increment by 1, the `<` vs `<=` distinction is academic. No bug.

---

### 3. `isLegalSideStep` does not check if landing is `UNREACHABLE`

**Severity:** Medium

```typescript
if (state.isOnBoard(landing)) {
    if (state.isPlayerAt(landing)) {
        return MGPFallible.failure(AbaloneFailure.TRANSLATION_IMPOSSIBLE());
    }
    if (state.getPieceAt(landing) === FourStatePiece.EMPTY) {
        newBoard[landing.y][landing.x] = player;
    }
}
```

The check `state.isPlayerAt(landing)` returns false for `UNREACHABLE` cells. If a lateral move lands on an `UNREACHABLE` cell (the hexagonal border cells that exist in the rectangular array), the piece would be placed there — but `UNREACHABLE` is not `EMPTY` so the `if` branch for setting `newBoard[landing.y][landing.x] = player` wouldn't fire. The piece would effectively be lost silently (the original cell is cleared, but the landing cell is not set). This could be a bug for edge pieces translating toward `UNREACHABLE` cells.

---

## No Other Issues Found

- Singleton pattern is correctly implemented.
- Config validation uses `MGPValidators.range` correctly.
