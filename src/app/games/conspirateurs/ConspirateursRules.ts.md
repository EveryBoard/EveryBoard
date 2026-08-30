# Review: `games/conspirateurs/ConspirateursRules.ts`

## Summary
Rules for Conspirateurs. One minor finding.

---

## Findings

### 1. `jumpLegality` returns `MGPFallible.failure` instead of `MGPValidation.failure`

**Severity:** Cosmetic

```typescript
public jumpLegality(move: ConspirateursMoveJump, state: ConspirateursState): MGPValidation {
    for (const coord of move.coords) {
        if (state.isNotOnBoard(coord)) {
            return MGPFallible.failure(CoordFailure.OUT_OF_RANGE(coord));  // inconsistent
        }
    }
```

The method return type is `MGPValidation`, but this one path returns `MGPFallible.failure(...)` rather than `MGPValidation.failure(...)`. If `MGPValidation` is structurally compatible with `MGPFallible<void>`, TypeScript accepts this silently. All other failure returns in the method use `MGPValidation.failure`, making this an inconsistency.

---

## No Other Issues Found

- Drop phase boundary (`turn < 40` for 40 total pieces) is correct.
- `jumpLegality` correctly validates that jumped-over coords are occupied and landings are empty.
- `nextJumps` correctly builds multi-hop jumps against the original (unmodified) state.
