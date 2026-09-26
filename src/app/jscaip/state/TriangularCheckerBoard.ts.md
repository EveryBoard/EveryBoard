# Review: `jscaip/state/TriangularCheckerBoard.ts`

## Summary
Static utility class. One subtle issue in `createBoard` regarding size=1, and `getFakeNeighbors` returns an off-board coord by design.

---

## Findings

### 1. `createBoard` width formula produces unexpected result for size=1

**Severity:** Low

```typescript
const width: number = (size * 2) - (size % 2);
const lineStartIndex: number = size - (size % 2);
```

For `size = 1`: `width = 1`, `lineStartIndex = 0`.  
The board is `TableUtils.create(1, 1, empty)` — a 1×1 grid. The loop then sets `board[0][0] = full` since `diagonalIndex = 0 + 0 = 0` is in `[0, 0]`. This produces a 1-cell board with no triangular structure. Whether this edge case is valid depends on the game using it, but there is no assertion that `size >= 2`.

---

### 2. `getCommonNeighbor` returns the first common neighbor, not all

**Severity:** Informational

Returns at most one common neighbor even if two triangular cells share two common neighbors (which can happen near boundaries). If callers assume uniqueness they may behave incorrectly. The method is named singular, so this is expected — but callers should be aware.

---

### 3. `getFakeNeighbors` returns a potentially off-board coord

**Severity:** Informational (by design)

The method name "fake" suggests this is intentional — it returns the coord in the direction opposite to the cell's available directions. No bounds check is performed. Callers must check `isInRange` before using the result.

---

## No Other Issues Found

- `getDirections` correctly encodes the alternating triangular structure.
- `isSpaceDark` correctly identifies dark cells by parity.
- `createBoard` correctly populates only the triangular region.
