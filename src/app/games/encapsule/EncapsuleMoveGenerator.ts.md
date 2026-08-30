# Review: `games/encapsule/EncapsuleMoveGenerator.ts`

## Summary

Move generator for Encapsule (drops and board moves). One minor finding.

---

## Findings

### 1. `getKeyList()` on remaining pieces includes sizes with count 0

**Severity:** Cosmetic / Minor inefficiency

```typescript
const puttablePieces: number[] = state.getRemainingPiecesOfPlayer(currentPlayer).getKeyList();
```

`NumberMap` keys are never removed — when all pieces of a given size are dropped, the count reaches 0 but the key remains. `getKeyList()` therefore includes zero-count sizes, causing unnecessary `isLegal` calls that are rejected by `isInRemainingPieces`. Functionally correct (the legality check filters them), but wastes iterations. Could filter with `.filter(size => map.get(size).get() > 0)` before iterating.

---

## No Other Issues Found

- Board move generation correctly guards `landingCoord.equals(coord) === false`.
- `belongsTo(currentPlayer)` correctly identifies spaces where the current player holds the top piece, so only those are used as source coordinates.
