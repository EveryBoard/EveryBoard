# Review: `jscaip/HexagonalUtils.ts`

## Summary
Clean utility. One semantic note on `getNeighbors` with `distance > 1`.

---

## Findings

### 1. `getNeighbors(coord, distance)` does not return a complete ring for `distance > 1`

**Severity:** Low (documentation gap)

```typescript
public static getNeighbors(coord: Coord, distance: number = 1): Coord[] {
    for (const direction of HexaDirection.factory.all) {
        result.push(coord.getNext(direction, distance));
    }
}
```

For `distance = 1` this returns the 6 immediate hex neighbors — correct. For `distance = 2`, it returns only 6 coords (the 6 cells exactly 2 steps away in each of the 6 axis directions), not the 12-cell ring at hex distance 2. Callers expecting a full ring would miss the 6 "off-axis" cells.

The parameter name `distance` implies a ring, but the implementation gives only axis-aligned points. Rename to `getAxisNeighbors` or document the limitation.

---

## No Other Issues Found

- `areNeighbors` correctly checks all 6 hex directions.
- `createBoard` correctly marks cells as `full` within the ADI/DDI bounds that define a hexagonal region.
