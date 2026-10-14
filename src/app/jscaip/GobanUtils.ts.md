# Review: `jscaip/GobanUtils.ts`

## Summary
Correct for standard Go board sizes. One latent bug for very small boards.

---

## Findings

### 1. `getHoshis` produces negative/out-of-bounds coords for boards with width or height < 5

**Severity:** Low (in practice, Go boards are at least 5×5, but no guard exists)

```typescript
public static getHorizontalLeft(width: number): number {
    return width < 12 ? 2 : 3;
}
public static getHorizontalRight(width: number): number {
    const left = GobanUtils.getHorizontalLeft(width);
    return width - (left + 1); // negative for width < 3
}
```

For `width = 2`: `left = 2`, `right = 2 - 3 = -1` — a negative x coordinate is added as a hoshi. For `width = 1`: `right = -2`. These off-board coords would be returned from `getHoshis` and potentially rendered outside the SVG canvas.

**Recommendation:** Add a guard: `if (width < 5 || height < 5) return []` (standard Go boards are always at least 5×5).

---

### 2. Condition `12 < width` should probably be `12 <= width`

**Severity:** Low (ambiguity)

Standard Go is played on 9×9, 13×13, 19×19 boards. The condition for adding middle-row hoshis is `12 < width` (i.e., width ≥ 13). A 12×12 board has no middle hoshi. Whether this is intentional depends on convention — a 12×12 board is non-standard and likely never occurs in the games.

---

## No Other Issues Found

- For standard board sizes (9, 13, 19), hoshi positions are correct.
- Symmetric left/right and up/down calculations are correct.
- Center hoshi correctly requires both dimensions to be odd (so a center cell exists).
