# Review: `games/epaminondas/epaminondas.component.ts`

## Summary

UI component for Epaminondas. One informational finding.

---

## Findings

### 1. `lastPiece` is declared and reset but never assigned a non-empty value

**Severity:** Informational

```typescript
public lastPiece: MGPOptional<Coord> = MGPOptional.empty();
// ...
public override cancelMoveAttempt(): void {
    this.firstPiece = MGPOptional.empty();
    this.possibleMoves = [];
    this.lastPiece = MGPOptional.empty();  // reset but never set
}
```

`lastPiece` is initialized to empty and cleared in `cancelMoveAttempt`, but there is no assignment to a non-empty value anywhere in this file. If it is consumed by the template (e.g., for highlighting the last selected piece), it would always render as absent. If it is unused, it is dead code.

---

## No Other Issues Found

- `showLastMove` correctly computes `stepSize + phalanxSize` total coords in `moveds` (covering old + new phalanx positions), and correctly starts the capture loop at the first coord beyond the moved region.
- `getPossibleMoves` break-on-failure correctly assumes that if step k is illegal, step k+1 is also illegal (incrementally blocked path).
- `getStepSize` is safe: `clicked` inside the phalanx is intercepted at line 196 and redirected to `firstClick`, so the loop always terminates.
- `secondClick` correctly handles re-selection of a new first piece when the user clicks another of their own pieces.
