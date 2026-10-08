# Review: `games/epaminondas/EpaminondasPhalanxSizeAndFilterMoveGenerator.ts`

## Summary

Filtered move generator for Epaminondas (top 40 by phalanx size). One cosmetic finding.

---

## Findings

### 1. `state` parameter of `orderMovesByPhalanxSizeAndFilter` is unused

**Severity:** Cosmetic

```typescript
private orderMovesByPhalanxSizeAndFilter(moves: EpaminondasMove[], state: EpaminondasState): EpaminondasMove[] {
```

`state` is passed in but never used inside the method. The `EpaminondasState` import is therefore also unused. Both can be removed.

---

## No Other Issues Found

- Slicing to 40 moves is a reasonable hard cap for performance-sensitive Minimax.
- Sorting by descending `phalanxSize` is a reasonable ordering heuristic.
