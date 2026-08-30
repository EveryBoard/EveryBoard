# Review: `jscaip/Vector.ts`

## Summary
Two issues: a NaN crash on zero vector and a dead string replacement.

---

## Findings

### 1. `toMinimalVector()` produces NaN for the zero vector

**Severity:** Low (edge case)

```typescript
public toMinimalVector(): Vector {
    const greatestCommonDivisor: number = MathUtils.gcd(this.x, this.y);
    return new Vector(this.x / greatestCommonDivisor, this.y / greatestCommonDivisor);
}
```

If `this.x === 0 && this.y === 0`, `gcd(0, 0)` is conventionally 0, giving `0/0 = NaN`. The resulting vector `(NaN, NaN)` would silently propagate into any computation using it. While a zero vector shouldn't normally be minimised, there is no guard.

**Recommendation:** Add `Utils.assert(this.x !== 0 || this.y !== 0, 'Cannot reduce zero vector')`.

---

### 2. `toHTMLClassName()` replacement never triggers

**Severity:** Low (dead code)

```typescript
public toHTMLClassName(): string {
    return this.toString().replace('_', '-');
}
```

`toString()` produces `(x, y)` format — no underscores. The `.replace('_', '-')` is always a no-op. Either the format was changed at some point and this replacement was left behind, or a different format was intended.

---

## No Other Issues Found

- `combine` correctly defaults `times = 1`.
- `isSingleOrthogonalStep`, `isOrthogonal`, `isDiagonal` all compute correctly.
