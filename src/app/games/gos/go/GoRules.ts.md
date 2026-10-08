# Review: `games/gos/go/GoRules.ts`

## Summary

Rules for standard Go. One informational finding.

---

## Findings

### 1. Handicap placement order deviates from standard Go conventions for 2 stones

**Severity:** Informational

```typescript
const orderedHandicaps: Coord[] = [
    new Coord(left, up),     // top-left star point (1st)
    new Coord(right, down),  // bottom-right star point (2nd)
    ...
```

Standard 2-stone handicap in Go places stones at **top-right** and **bottom-left** (diagonally opposite), not top-left and bottom-right. The standard ordering for 2 stones is: bottom-right, then top-left (AGA) or top-right + bottom-left (others). This is a rules convention issue, not a code bug, but players expecting standard handicap placement will get a non-standard configuration.

---

## No Other Issues Found

- Turn correctly starts at 1 (Light moves first) when handicap >= 1 — Dark's pre-placed stones serve as their "moves".
- Handicap count validator `range(0, 9)` matches the 9 available handicap positions.
- `getGoGroupDataFactory()` creates a new `OrthogonalGoGroupDataFactory()` on each call — correct but could be a singleton; not a bug.
