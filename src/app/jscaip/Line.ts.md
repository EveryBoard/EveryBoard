# Review: `jscaip/Line.ts`

## Summary
Minimal value class. No logic issues.

---

## Findings

### 1. No `equals` or `toString` methods

**Severity:** Informational

`Line` has no `equals` method, so it cannot be used as a key in `MGPMap` (which requires `ComparableObject`) and comparisons use identity (`===`). No `toString` makes debugging harder. If `Line` is only used for SVG rendering (which seems likely given the `x1/y1/x2/y2` naming matching SVG `<line>` attributes), this is acceptable.

---

## No Other Issues Found

- Fields are `readonly` — correctly immutable.
