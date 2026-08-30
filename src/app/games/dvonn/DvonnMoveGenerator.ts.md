# Review: `games/dvonn/DvonnMoveGenerator.ts`

## Summary
Move generator for Dvonn. One cosmetic finding.

---

## Findings

### 1. `return` before `DvonnRules.pieceTargets(...).forEach(...)` is meaningless

**Severity:** Cosmetic

```typescript
DvonnRules.getMovablePieces(state).forEach((start: Coord) => {
    return DvonnRules.pieceTargets(state, start).forEach(...);
});
```

`Array.forEach` always returns `void`. The `return` statement inside the outer `forEach` callback has no effect — it does not break or skip any iteration.

---

## No Other Issues Found

- `DvonnMove.from(start, end).get()` is safe: targets come from `pieceTargets` which guarantees valid hex neighbor positions.
- PASS generation correctly checks that the previous move wasn't also PASS.
