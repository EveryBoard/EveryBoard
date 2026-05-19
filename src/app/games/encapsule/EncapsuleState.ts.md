# Review: `games/encapsule/EncapsuleState.ts`

## Summary

State and space classes for Encapsule. Two cosmetic findings.

---

## Findings

### 1. `isEmptyKeyValue` name is inverted — it returns `true` for occupied values

**Severity:** Cosmetic

```typescript
private isEmptyKeyValue(_: number, value: PlayerOrNone): boolean {
    return value.isPlayer();  // returns true when the slot IS occupied, not when it is empty
}
```

The method is used as a filter in `getOccupiedCircles`, and the logic is correct, but the name implies it identifies empty slots. Should be named `isOccupiedKeyValue` or similar.

---

### 2. `getRemainingPiecesOfPlayer` copies both players' maps to read one

**Severity:** Cosmetic / Minor inefficiency

```typescript
public getRemainingPiecesOfPlayer(player: Player): EncapsuleSizeToNumberMap {
    return this.getRemainingPiecesCopy().get(player);  // copies both players' maps unnecessarily
}
```

`getRemainingPiecesCopy()` builds a full defensive copy of both players' `EncapsuleSizeToNumberMap`, then only one is returned. The caller gets an immutable copy, so the copy of the other player is discarded. Could directly copy the target player's map.

---

## No Other Issues Found

- `EncapsulePiece.NONE` is a singleton; `=== EncapsulePiece.NONE` identity checks in `tryToSuperposePiece` and `removeBiggest` are safe.
- `getBiggest` uses `ArrayUtils.maximumsBy` correctly — sizes are unique integers, so at most one maximum exists.
- `isInRemainingPieces` casts `piece.getPlayer() as Player` safely because it is only reachable from `isDroppable`, which first checks `pieceBelongsToCurrentPlayer` (ruling out `PlayerOrNone.NONE`).
