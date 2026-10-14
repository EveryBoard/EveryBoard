# Review: `jscaip/RulesFailure.ts`

## Summary
Simple message catalogue. No logic issues. One duplicate-intent finding.

---

## Findings

### 1. `MUST_CLICK_ON_EMPTY_SPACE` and `MUST_CLICK_ON_EMPTY_SQUARE` are near-duplicates

**Severity:** Informational

Both messages tell the user to click on an empty cell, differing only in "space" vs "square". This suggests inconsistent terminology in the UI. A user seeing both across different games could be confused about a distinction that does not exist.

**Recommendation:** Consolidate into one message, or document that "space" and "square" intentionally refer to different board geometries (hex vs. rectangular).

---

## No Other Issues Found

- All messages are correctly `Localized` (lazy thunks returning `$localize` tagged strings).
- `MOVE_CANNOT_BE_STATIC` is used in `MoveCoordToCoord` constructor — correct placement.
