# Review: `games/apagos/ApagosRules.ts`

## Summary
Apagos rules implementation. One unconfirmed concern was checked against the local tests.

---

## Findings

### 1. `applyLegalDrop` swaps squares after a drop

**Severity:** Not confirmed / needs rules specification

```typescript
if (move.landing === config.width - 1) {
    return nextTurnState.updateAt(move.landing, newSquare);
} else {
    const descendingX: number = move.landing + 1;
    const descendingSquare: ApagosSquare = nextTurnState.getPieceAt(descendingX);
    const intermediaryState: ApagosState = nextTurnState.updateAt(move.landing, descendingSquare);
    return intermediaryState.updateAt(descendingX, newSquare);
}
```

When a piece is dropped on a non-final square, the modified landing square is swapped with the square to its right. This initially looked suspicious, but the behavior is explicitly covered by `ApagosRules.spec.ts`: dropping on low square `1` moves the modified square one place up, and dropping on the highest square leaves it in place.

This should not be treated as a confirmed implementation bug unless the external Apagos rules specification contradicts those tests.

---

## Confirmed Checks

- `getGameStatus` correctly first checks if all squares are full, then sweeps from highest to lowest to find the first decisive dominator.
- `isLegalSlideDown` correctly verifies player ownership at the starting square.
- Singleton pattern is correctly implemented.
