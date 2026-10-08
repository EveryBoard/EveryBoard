# Review: `components/game-components/GameComponentUtils.ts`

## Summary
`ViewBox` utility class is well-structured and correct. One cosmetic note about `flatMap` usage.

---

## Findings

### 1. `flatMap` used where `map` is intended in `fromHexa`

**Severity:** Cosmetic

```typescript
const points: Coord[] = coords.flatMap((coord: Coord) => hexaLayout.getCenterAt(coord));
```

`getCenterAt` returns a single `Coord`, not an array. `Array.flatMap` only flattens actual arrays (not arbitrary iterables), so this is functionally equivalent to `map`. The `flatMap` call is misleading — `map` would better express the intent.

---

### 2. `getLimits` with empty array returns invalid infinity bounds

**Severity:** Informational

If `coords` is empty, `getLimits` returns `{ minX: +Inf, minY: +Inf, maxX: -Inf, maxY: -Inf }`. `fromHexa` called with empty coords would produce a `ViewBox` with `NaN` or negative infinity dimensions. Callers must guarantee non-empty input.

---

## No Other Issues Found

- `expand` correctly adjusts position and dimensions in all four directions.
- `containingAtLeast` correctly passes `(left, right, up, bottom)` to `fromLimits(minX, maxX, minY, maxY)`.
- `fromLimits` correctly derives width/height from bounds.
