# Review: `games/encapsule/encapsule.component.ts`

## Summary

UI component for Encapsule. One informational finding.

---

## Findings

### 1. `calculateLeftPieceCoords` can place remaining-piece indicators off-screen for large configs

**Severity:** Informational

```typescript
if (index < height + 1) {
    abstractCoord = abstractCoord.getNext(Orthogonal.DOWN);
} else {
    abstractCoord = abstractCoord.getNext(Orthogonal.RIGHT);
}
```

After filling `height + 1` slots vertically, subsequent pieces keep shifting RIGHT indefinitely. For wide boards with many piece sizes the overflow goes off-screen. Not a problem with the default 3×3 / 3-size config, but could look broken under custom configs with large `nbOfSizes`.

---

## No Other Issues Found

- `onBoardClick` correctly handles the three cases: (1) piece chosen → create drop, (2) no piece, no coord → select source coord, (3) coord already chosen → create board move or cancel on same-coord click.
- `getRemainingPiecesTypeOfPlayer` correctly filters out zero-count sizes before mapping to pieces (unlike the move generator which relies on legality check).
- `getRemainingPieceQuantity` and `getRemainingPieceTranslate` are called only for pieces in the remaining-pieces set, so the `as Player` cast and array index access are safe.
- `isSelectedPiece` uses `MGPOptional.equalsValue` which delegates to `EncapsulePiece.equals` — correct for non-singleton pieces.
