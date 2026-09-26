# Review: `games/apagos/ApagosFullBoardHeuristic.ts`

## Summary
Full-board heuristic for Apagos. One issue found.

---

## Findings

### 1. `PlayerNumberTable.of([0,0,0,0], [0,0,0,0])` hardcodes 4 metrics — crashes for widths != 4

**Severity:** High

```typescript
const result: PlayerNumberTable = PlayerNumberTable.of(
    [0, 0, 0, 0],
    [0, 0, 0, 0],
);
```

The result table is initialized with 4 metrics per player. If `board.length` is not 4 (e.g., width = 2 or 7), `result.add(levelDominant, i, 1)` will access index `i` beyond the initialized size, causing incorrect behavior or an out-of-bounds error. The table size should be `new Array(size).fill(0)` to match the actual board width.

---

## No Other Issues Found

- Priority ordering (highest index = highest priority = first metric) is correct.
- Iterating from highest to lowest index with `size - 1 - i` correctly maps priority.
