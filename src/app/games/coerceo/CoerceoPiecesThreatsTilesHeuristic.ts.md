# Review: `games/coerceo/CoerceoPiecesThreatsTilesHeuristic.ts`

## Summary
Heuristic computing piece safety, threats, and tile counts. Two issues found.

---

## Findings

### 1. `getThreat` pushes `coord` instead of `movingThreat` into the mover list

**Severity:** Medium

```typescript
for (const step of CoerceoStep.STEPS) {
    const movingThreat: Coord = uniqueFreedom.get().getNext(step.direction, 1);
    if (this.isMovingThreat(coord, movingThreat, state, directThreats)) {
        movingThreats.push(coord);  // <-- should be movingThreat
    }
}
```

`coord` is the piece being evaluated for threats, not the piece that could move to threaten it. The `mover` set in the resulting `PieceThreat` records the threatened piece itself rather than the threatening opponent pieces. In `filterThreatMap`, the filter checks whether movers are themselves threatened — with wrong mover coords this check operates on the wrong player's pieces. In practice, since `getMetrics` only checks `filteredThreatMap.get(coord).isPresent()`, the bug mainly affects which threats survive `filterThreatMap`, potentially over- or under-counting threatened pieces.

---

### 2. `filterThreatMap` overwrites `newThreat` for each valid direct threat

**Severity:** Informational

```typescript
for (const directOldThreat of oldThreat.directThreats) {
    if (threatenedOpponentPieces.contains(directOldThreat) === false) {
        ...
        if (newMover.length > 0) {
            newThreat = MGPOptional.of(pieceThreat);
        }
    }
}
```

When a piece has multiple valid direct threats, `newThreat` is overwritten on each iteration — only the last valid `(directThreat, mover)` pair survives. The accumulated movers from earlier iterations are discarded. Since only `newThreat.isPresent()` is checked by the caller, the wrong threat content doesn't affect the final metric, but the logic intent appears to be to accumulate all real threats.

---

## No Other Issues Found

- `tileCouldBeRemovedThisTurn` correctly iterates the 2×3 tile region.
- `pieceCouldLeaveTheTile` correctly checks cross-tile movement.
