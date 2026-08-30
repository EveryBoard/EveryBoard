# Review: `jscaip/AI/BoardValue.ts`

## Summary
One dead/broken method (`isPreVictory`); otherwise correct.

---

## Findings

### 1. `isPreVictory` is always equivalent to `isVictory` — dead code

**Severity:** Medium

```typescript
public static isPreVictory(score: number): boolean {
    return score === Number.POSITIVE_INFINITY - 1 || score === Number.NEGATIVE_INFINITY + 1;
}
```

In JavaScript, `Number.POSITIVE_INFINITY - 1 === Number.POSITIVE_INFINITY` (infinity arithmetic: `Infinity - 1 = Infinity`). Similarly, `Number.NEGATIVE_INFINITY + 1 === Number.NEGATIVE_INFINITY`. Therefore:
- `isPreVictory(+Infinity) === true` (same as `isVictory`)
- `isPreVictory(anyFiniteNumber) === false`

The method is semantically identical to `isVictory` and cannot detect "one step before victory" as intended. Fortunately, `isPreVictory` has zero callers outside the file itself, so no active bug exists.

**Recommendation:** If pre-victory detection is needed, use a large finite sentinel (e.g., `Number.MAX_SAFE_INTEGER - 1`) as the pre-victory score instead of `Infinity - 1`.

---

### 2. `VICTORIES` is `public static` mutable array

**Severity:** Low

```typescript
public static VICTORIES: number[] = [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];
```

External code can push to or clear `VICTORIES`, breaking all callers. Should be `public static readonly VICTORIES: readonly number[]`.

---

## No Other Issues Found

- `ofMultiple` correctly computes `(-p0 + p1)` as the combined metric, consistent with `Player.ZERO.getVictoryValue() = -Infinity` and `Player.ONE.getVictoryValue() = +Infinity`.
- `toMaximum()` / `toMinimum()` correctly create all-infinity vectors for alpha-beta initialisation.
- `equals` correctly delegates to element-wise array comparison.
