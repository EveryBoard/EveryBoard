# Review: `jscaip/HexaLayout.ts`

## Summary
Mostly correct rendering utility. Two issues: a contradictory comment and a redundant `new Coord` allocation.

---

## Findings

### 1. `getIsoPoints` comment contradicts the assertion

**Severity:** Medium (documentation bug)

```typescript
// So far, only used in a pointy orientation, may need to be adapted for a flat orientation.
public getIsoPoints(...): ... {
    Utils.assert(this.orientation === FlatHexaOrientation.INSTANCE, ...);
```

The comment says the method is used in "pointy orientation" and may need to be adapted for "flat orientation", but the assertion requires **flat orientation**. The comment appears to be copy-pasted from an earlier version and never updated. A future developer reading the comment would be confused about which orientation this applies to.

**Recommendation:** Update the comment to reflect reality.

---

### 2. `getHexaPointsList` creates unnecessary `Coord` copies

**Severity:** Cosmetic

```typescript
const offset: Coord = this.getCornerOffset(i);
corners.push(new Coord(offset.x, offset.y));  // ← redundant copy
```

`getCornerOffset` already returns a `Coord`. The `new Coord(offset.x, offset.y)` creates an identical copy. Should be `corners.push(offset)`.

---

### 3. `Coord` used for floating-point pixel positions

**Severity:** Informational

`Coord` stores integer-typed coordinates (intended for board grid positions). `getCornerOffset` stores `Math.cos`/`Math.sin` float results in a `Coord`. While JavaScript allows this, `Coord.equals` uses `===` on the `x` and `y` fields, so floating-point equality comparisons on corner offsets would be unreliable. This is acceptable for SVG rendering where no equality check on corner positions is needed, but is a misuse of the `Coord` type.

---

## No Other Issues Found

- `getCenterAt` correctly applies the 2D linear transformation using the orientation matrix.
- `getHexaPoints` and `getHexaDiagonalPoints` correctly delegate to `getHexaPointsList`.
