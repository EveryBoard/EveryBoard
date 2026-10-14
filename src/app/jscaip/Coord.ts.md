# Review: `jscaip/Coord.ts`

## Summary
Well-implemented. Three findings: inconsistent default for alignment check, `isHexagonallyAlignedWith` returns false for self, and a comment typo.

---

## Findings

### 1. Inconsistent `checkAlignment` defaults between `getLinearDistanceToward` and `getDistanceToward`

**Severity:** Medium (potential silent misuse)

```typescript
public getLinearDistanceToward(c: Coord, checkAlignment: boolean = true): number {
    return this.getDistanceToward(c, checkAlignment);
}
public getDistanceToward(c: Coord, checkAlignment: boolean = false): number {
    Utils.assert(checkAlignment === false || c.isAlignedWith(this), ...);
    ...
}
```

`getLinearDistanceToward` defaults to `checkAlignment = true` (asserts alignment), but `getDistanceToward` defaults to `checkAlignment = false` (no assertion). A caller using `getDistanceToward` directly on misaligned coords gets Chebyshev distance (max of dx, dy) without any error, which is probably wrong for "linear" distance semantics.

The public name `getLinearDistanceToward` correctly implies alignment is required, but `getDistanceToward` should not be public if it silently accepts non-aligned inputs — it's a footgun.

**Recommendation:** Make `getDistanceToward` `private`, keeping only `getLinearDistanceToward` public. Or unify the defaults to always check alignment.

---

### 2. `isHexagonallyAlignedWith` returns `false` for a coord with itself

**Severity:** Low (edge case)

```typescript
public isHexagonallyAlignedWith(coord: Coord): boolean {
    const sdx: number = this.x - coord.x;
    const sdy: number = this.y - coord.y;
    if (sdx === sdy) return false;   // ← when both are 0, this fires
    ...
}
```

When `this.equals(coord)`, `sdx = sdy = 0`, so `sdx === sdy` is true and the method returns `false`. Semantically, any point is trivially aligned with itself on all three hex axes. Callers that pass the same coord twice would get `false` unexpectedly.

The same is not true for `isAlignedWith`: `dx = dy = 0` → `dx * dy = 0` → returns `true` (correct).

**Recommendation:** Add early return: `if (this.equals(coord)) return true;`

---

### 3. Comment typo in `getRight`

**Severity:** Cosmetic

```typescript
const newY: number = this.y + dir.x; // (this.x, thix.y) + (-dir.y, dir.x)
```

`thix.y` should be `this.y`.

---

### 4. `getCoordsToward` does not handle the case `this.equals(c)` with `includeStart = true`

**Severity:** Low

```typescript
if (this.equals(c)) {
    return coords;  // returns [this] if includeStart, or [] otherwise
}
```

When `this.equals(c)` and `includeStart = true`, the result is `[this]` (just the start). When `includeEnd = true` but not `includeStart`, the result is `[]` even though the end coord should arguably be included. This is consistent with the "empty range" interpretation but could surprise callers.

---

## No Other Issues Found

- `isAlignedWith` correctly identifies orthogonal and diagonal alignment.
- `isHexagonallyAlignedWith` correctly identifies the three hex axes for non-equal coords.
- `getLeft`/`getRight` rotation formulas are correct (verified by example).
- `compareTo` correctly implements row-major ordering.
- `getOrthogonalDistance` correctly computes Manhattan distance.
