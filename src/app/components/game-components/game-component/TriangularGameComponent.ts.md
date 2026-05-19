# Review: `components/game-components/game-component/TriangularGameComponent.ts`

## Summary
Clean triangular board rendering base. No bugs found.

---

## Findings

### 1. `getTriangleCornerCoordsAtXY` returns 4 points for a 3-corner triangle

**Severity:** Informational

```typescript
return [leftCorner, middleCorner, rightCorner, leftCorner];
```

The first corner is repeated as the last. SVG polygons auto-close, so this is redundant but harmless.

---

### 2. `SPACE_SIZE` override is a no-op (same value as parent default)

**Severity:** Informational

```typescript
public override SPACE_SIZE: number = 100;
```

The parent `BaseGameComponent` already defaults `SPACE_SIZE = 100`. This override adds no functional change. If it's intended to document that subclasses should adjust this, a comment would help.

---

## No Other Issues Found

- Triangle/pyramid orientation (upward when `(x+y)` even, downward when odd) is consistent between `getTriangleCornerCoordsAtXY` and `getPyramidPointsAtXY`.
- Pyramid rendering with 11-point polygon sequences correctly draws 4 triangular faces.
