# Review: `jscaip/GipfProjectHelper.ts`

## Summary
`GipfCapture` is well-validated. The combination algorithm in `GipfProjectHelper` is correct but mutates arrays mid-iteration in the "no intersections" path, which is subtle.

---

## Findings

### 1. `getPossibleCaptureCombinationsFromPossibleCaptures` mutates arrays during the no-intersection path

**Severity:** Low (works correctly but fragile)

```typescript
if (intersections[index].length === 0) {
    captureCombinations.forEach((combination: number[]) => {
        combination.push(index);  // ← mutates the array in-place
    });
}
```

This directly mutates every existing combination array. In the intersecting path, arrays are always copied via `ArrayUtils.copy`. The inconsistency means that if the no-intersection path fires and later a copy is made of a combination that was already mutated, the mutation is "baked in". This works correctly today because the no-intersection mutation happens before any further copies, but the inconsistency is a maintenance trap — if the order of processing is ever changed, subtle bugs could result.

**Recommendation:** Standardise on always copying combinations:
```typescript
captureCombinations = captureCombinations.map((combination: number[]) => [...combination, index]);
```

---

### 2. `GipfCapture` sort comparator is not entirely deterministic for s-lines

**Severity:** Low

For an s-line (x+y = constant), pairs of coords have neither equal x nor equal y. The sort falls to `return coord1.x > coord2.x ? 1 : -1`. For an s-line going from top-right to bottom-left, lower x means higher y. Sorting by x gives left-to-right ordering, which is consistent and correct. However the comment in the code doesn't explain this logic, making it hard to verify.

---

### 3. `computeIntersections` is O(n²) in the number of captures

**Severity:** Informational (captures are at most ~4–8 per position in Gipf-like games, so this is fine in practice)

---

## No Other Issues Found

- Constructor correctly validates: minimum 4 coords, same hex line, no duplicates, consecutiveness.
- `contains` and `intersectsWith` are correct linear scans (acceptable given small capture sizes).
- `getLine()` correctly uses the first two sorted coords to identify the line.
- `equals` correctly compares element-by-element after the constructor guarantees sorted order.
