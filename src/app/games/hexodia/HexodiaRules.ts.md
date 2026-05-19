# Review: `games/hexodia/HexodiaRules.ts`

## Summary

Rules for Hexodia (hexagonal N-in-a-row). Two medium findings.

---

## Findings

### 1. `isLegalDrop` does not reject placements on UNREACHABLE cells

**Severity:** Medium

```typescript
public isLegalDrop(move: HexodiaMove, state: HexodiaState): MGPValidation {
    for (const coord of move.coords) {
        if (state.isNotOnBoard(coord)) {
            return MGPValidation.failure(CoordFailure.OUT_OF_RANGE(coord));
        }
        if (state.getPieceAt(coord).isPlayer()) {
            return MGPValidation.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
        }
    }
    return MGPValidation.SUCCESS;
}
```

`FourStatePiece.UNREACHABLE.isPlayer()` returns `false` (it is neither player 0 nor player 1). UNREACHABLE cells are within the board bounds (they're part of the underlying array). As a result, a move dropping a piece on a hex outside the playable area but inside the bounding rectangle — an UNREACHABLE cell — passes both checks and is accepted as legal. `applyLegalMove` then overwrites an UNREACHABLE cell with a player piece, corrupting the board.

Fix: check specifically for EMPTY, not merely for non-player:

```typescript
if (state.getPieceAt(coord) !== FourStatePiece.EMPTY) {
    return MGPValidation.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
}
```

---

### 2. `isLegal` uses `Utils.assert` for move-count validation instead of returning failure

**Severity:** Medium

```typescript
Utils.assert(numberOfDrops === 1, 'HexodiaMove should only drop one piece at first turn');
// ...
Utils.assert(numberOfDrops === requiredDrop, 'HexodiaMove should have exactly ...');
```

`Utils.assert` throws a hard crash on failure. For a validation method exposed to network/replay input, invalid move counts should return `MGPValidation.failure(...)` rather than crash. If a replayed or network-received move has an unexpected number of drops, the application crashes rather than rejecting the move gracefully.

Additionally, the error message in the second `assert` always shows `config.numberOfDrops`, even though the actual required count may be `Math.min(remainingSpaces, config.numberOfDrops)` when the board is nearly full — slightly misleading.

---

## No Other Issues Found

- Helper memoization via `MGPMap<number, helper>` is correct: one helper per `nInARow` size.
- `getGameStatus` correctly uses `getCurrentOpponent()` (the player who just moved) to determine the winner after move application.
- `getInitialState` hexagonal mask formula `size - 2 < diagonalIndex && diagonalIndex < maximumDiagonalIndex` correctly carves a hex board from a rectangular array.
- `Math.min(remainingSpaces, config.numberOfDrops)` correctly handles end-game when fewer spaces remain than `numberOfDrops`.
