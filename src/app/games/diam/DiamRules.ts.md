# Review: `games/diam/DiamRules.ts`

## Summary
Rules for Diam. One minor finding.

---

## Findings

### 1. `isDropLegal` uses `Utils.assert` for out-of-bounds check instead of returning a failure

**Severity:** Cosmetic

```typescript
Utils.assert(drop.target < DiamState.WIDTH, 'DiamMoveDrop out of board');
```

Out-of-bounds drops throw rather than returning `MGPValidation.failure(...)`. All other invalid conditions in this method return failures gracefully. Consistent with the pattern elsewhere in the codebase this should be `if (drop.target >= DiamState.WIDTH) return MGPValidation.failure(...)`.

---

## No Other Issues Found

- `applyLegalShift` reads from the original `state` while writing to `newBoard`, so no read-after-write issue.
- `findHighestAlignment` correctly skips row 0 (ground level, not a winning alignment) and checks opposite column pairs.
- `shiftHeightValidity` correctly computes the resulting stack height before allowing the shift.
