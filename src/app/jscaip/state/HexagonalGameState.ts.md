# Review: `jscaip/state/HexagonalGameState.ts`

## Summary
Mostly sound. One potential issue in `getEntranceOnLine` for 'q' and 'r' lines that deserves scrutiny, and one missing null-check in `getEntranceOnLine` regarding `excludedSpaces` indexing.

---

## Findings

### 1. `equalsT` omits `turn` — intentional but undocumented

**Severity:** Low (design choice, but fragile if misused)

`equalsT` compares width, height, empty piece, excludedSpaces, and board contents — but not `turn`. All concrete subclasses (`GipfState`, `YinshState`, `DvonnState`) add their own `equals` methods that do compare `turn`. The `equalsT` helper is thus a "board content equality" helper, not a full state equality.

This is fine, but there is no documentation comment indicating that callers are expected to check `turn` separately, leaving the method open to misuse by future subclasses that use `equalsT` as their full equality.

**Recommendation:** Add a comment: `// Subclasses must compare 'turn' separately`.

---

### 2. `getEntranceOnLine` case 'q' and 'r': `excludedSpaces` indexed by column instead of row

**Severity:** Low (functionally works but logic is unclear)

```typescript
case 'q':
    if (this.excludedSpaces[line.offset] != null) {
        y = this.excludedSpaces[line.offset];  // line.offset = column index
    } else {
        y = 0;
    }
    return this.findEntranceFrom(line, new Coord(line.offset, y));
```

`excludedSpaces` is semantically an array indexed by *row* (e.g., `excludedSpaces[rowY]` gives the leftward x-offset where row `y` starts). Here, `line.offset` is a *column* index (x), being used to index into `excludedSpaces`. This is a mismatched indexing.

The fallback `findEntranceFrom` will still find the correct entrance by walking in `HexaDirection.DOWN` until `isOnBoard` returns true. So the method is functionally correct even if the starting coord is wrong — but only as long as the computed `y` is ≤ the actual first on-board row for that column (otherwise it could walk past the entrance). There is no guarantee this holds.

Same issue exists for case 'r' using `x = this.excludedSpaces[line.offset]` where `line.offset` is a row index, and `excludedSpaces[rowIdx]` gives an x value — this one may actually be correctly indexed (row → excluded x count). Needs confirmation per specific hex grid shape.

**Recommendation:** Add a test for `allLines()` / `getEntranceOnLine()` on an asymmetric hexagonal board to verify the entrance computation is correct for all three line types.

---

### 3. `findEntranceFrom` loop bound may be insufficient for wide/tall grids

**Severity:** Low (theoretical)

```typescript
for (let i: number = 0; i < Math.max(this.width, this.height); i++) {
```

The loop walks at most `max(width, height)` steps. For a hexagonal grid, a line can span up to `width + height - 1 - excludedSpaces` cells. If the starting coord is off-board and located more than `max(width, height)` steps from the first on-board cell, this loop would fail and throw the logged error.

In practice, `getEntranceOnLine` starts at a coord near the edge, so this limit is almost always sufficient — but it is not guaranteed by geometry alone.

---

### 4. Constructor assertion uses floating-point comparison

**Severity:** Cosmetic

```typescript
Utils.assert(this.excludedSpaces.length < (this.height / 2) + 1, ...);
```

For odd `this.height`, `this.height / 2` is `0.5 * height` (non-integer). E.g., for `height = 9`, the bound is `5.5`. Since `length` is always an integer, the comparison works correctly in JavaScript — but this is non-obvious. A clearer form would be:

```typescript
Utils.assert(this.excludedSpaces.length <= Math.floor(this.height / 2), ...);
```

---

## No Other Issues Found

- `setAt` correctly guards with `isOnBoard` before delegating to the abstract `setAtUnsafe`.
- `allLines` generates the correct number of lines for each axis.
- `equalsT` correctly compares `excludedSpaces` element-by-element.
- `getEntranceOnLine` for 's' lines uses correct coordinate arithmetic.
