# Review: `games/encapsule/EncapsuleRules.ts`

## Summary

Rules for Encapsule. One minor finding.

---

## Findings

### 1. `applyLegalMove` unconditionally copies the current player's remaining pieces even for board moves

**Severity:** Cosmetic / Minor inefficiency

```typescript
const newRemainingPiecesMap: EncapsuleRemainingPieces = state.getRemainingPiecesCopy();
const newRemainingPiece: EncapsuleSizeToNumberMap = newRemainingPiecesMap.get(currentPlayer).getCopy();
// ...
if (move.isDropping()) {
    movingPiece = move.piece.get();
    newRemainingPiece.add(movingPiece.size, -1);
    newRemainingPiecesMap.put(currentPlayer, newRemainingPiece);
} else {
    // newRemainingPiece copy is created above but never used
}
```

`newRemainingPiece` is built via `.getCopy()` whether or not the move is a drop. For board moves the copy is immediately discarded. Not a correctness issue — the state is constructed with the correct (unmodified) `newRemainingPiecesMap` — but the extra allocation is wasted.

---

## No Other Issues Found

- `isLegal` correctly validates owner for both drops and board moves before the superposition check.
- `isVictory`'s `as Player` cast at line 119 is safe: the coord was identified as a winning alignment, so its top piece must belong to a real player.
- `getRemainingPiecesCopy` in `applyLegalMove` returns a mutable outer map with immutable inner maps; calling `.getCopy()` on the inner map before mutating is correct.
- No game-ending detection for draw / no moves available — the game appears to always be ONGOING until a victory alignment occurs (consistent with Encapsule rules).
