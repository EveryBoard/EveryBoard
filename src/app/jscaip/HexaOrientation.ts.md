# Review: `jscaip/HexaOrientation.ts`

## Summary
The combined `isOnBorder` is correct via OR-ing all six sides. However, individual border methods have incomplete coverage — `isOnLeftBorder` and `isOnRightBorder` miss the slanted portions of the hex border. One type inconsistency in the static `INSTANCE` field.

---

## Findings

### 1. `isOnLeftBorder` and `isOnRightBorder` only detect the straight middle portion

**Severity:** Medium (misleading API — individual methods are not reliable standalone)

```typescript
public isOnLeftBorder(...): boolean {
    return coord.x === 0;
}
```

For a hexagonal board, rows near the top have excluded cells from the left (`excludedSpaces[y] > 0`). The leftmost occupied cell in those rows has `x = excludedSpaces[y] > 0`. `isOnLeftBorder` returns `false` for those cells even though they ARE on the physical left boundary.

The same issue applies to `isOnRightBorder`: for rows near the bottom, the rightmost occupied cell is at `x < board.width - 1`.

These slanted portions are correctly covered by `isOnTopLeftBorder` and `isOnBottomRightBorder` respectively. So `isOnBorder` (which ORs all six) is correct. But callers using `isOnLeftBorder` directly would get an incomplete picture.

**Recommendation:** Either rename `isOnLeftBorder` to `isOnMiddleLeftBorder` (to reflect that it only covers straight rows), or expand it to include the excluded-spaces check.

---

### 2. `PointyHexaOrientation.INSTANCE` typed as `HexaOrientation` — loses specificity

**Severity:** Low

```typescript
public static INSTANCE: HexaOrientation = new PointyHexaOrientation();
```

`FlatHexaOrientation.INSTANCE` is typed as `FlatHexaOrientation`, allowing access to its methods (`isOnBorder`, etc.). `PointyHexaOrientation.INSTANCE` is typed as the abstract base, preventing callers from accessing pointy-specific methods without a cast. For consistency and usability, type it as `PointyHexaOrientation`.

---

### 3. `HexaOrientation` has no abstract methods — abstract declaration is misleading

**Severity:** Cosmetic

```typescript
export abstract class HexaOrientation {
    public readonly startAngle: number;
    ...
}
```

The class is abstract but has no `abstract` members — all subclass responsibility comes from field declaration (not enforcement). TypeScript would not warn if a subclass forgot to assign `conversionMatrix`. Making the fields `abstract readonly` would enforce this.

---

## No Other Issues Found

- `isOnTopRightBorder`, `isOnBottomLeftBorder` are correct.
- `isOnTopLeftBorder` and `isOnBottomRightBorder` correctly use `excludedSpaces`.
- Corner methods correctly AND two adjacent border checks.
- Conversion matrices are standard hex layout math (verified).
