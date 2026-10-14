# Review: `jscaip/DodecaHexaDirection.ts`

## Summary
Correct for its intended use. One inherited method returns wrong values for the four non-standard direction vectors.

---

## Findings

### 1. `toInt()` inherited from `Direction` returns 7 for four directions

**Severity:** Low (inherited flaw, probably never called)

`Direction.toInt()` handles only the 8 standard unit-vector directions. For `DIRECTION_030 (1,-2)`, `DIRECTION_090 (2,-1)`, `DIRECTION_210 (-1,2)`, `DIRECTION_270 (-2,1)`, none of the if-conditions match, so the `else` fallback returns 7 (the value for DOWN_RIGHT). All four of these non-unit directions silently share the same integer encoding via `toInt()`.

The `DodecaHexaDirection.encoder` correctly avoids `toInt()` (uses its own switch instead), so no actual serialisation bug exists. But `toInt()` should not be called on a `DodecaHexaDirection` with a non-unit vector.

**Recommendation:** Override `toInt()` in `DodecaHexaDirection` to return correct values for all 12 directions, or document that `toInt()` is not valid for this type.

---

## No Other Issues Found

- `toString()` correctly handles all 12 directions (4 explicit + 8 via `super.toString()`).
- `encoder` correctly maps all 12 directions to indices 0–11.
- `getOpposite()` is correct: `DIRECTION_030 (1,-2)` ↔ `DIRECTION_210 (-1,2)`, etc.
- `getAngle()` correctly returns 30° steps from 0° to 330°.
