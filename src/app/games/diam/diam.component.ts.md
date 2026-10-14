# Review: `games/diam/diam.component.ts`

## Summary
Diam UI component with reserve pieces and circular board. One cosmetic finding.

---

## Findings

### 1. `isSelected` uses `null` as a type discriminant

**Severity:** Cosmetic

```typescript
private isSelected(piece: DiamPiece | null, position?: Coord): boolean {
    if (piece == null && this.selected.get().type === 'pieceFromBoard') {
        ...
        return selected.position.equals(position as Coord);
    }
}
```

Using `null` as a sentinel and casting `position as Coord` is type-unsafe. If this method is ever called with `piece == null` and `position == undefined`, the `as Coord` cast would silently pass `undefined` to `equals`. The calling convention happens to always provide `position` when `piece` is `null`, but TypeScript doesn't enforce this. A discriminated union parameter or two separate methods would be safer.

---

## No Other Issues Found

- `updateRemainingPiecesInfo` chained `.get()` is safe because `remainingPieces` is initialized with both players.
- `showLastMoveOnPieces` array indexing is safe because destination pieces are in the current state.
