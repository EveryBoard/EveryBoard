# Review: `games/conspirateurs/ConspirateursMove.ts`

## Summary
Move types for Conspirateurs (drop, simple step, multi-hop jump). One informational finding.

---

## Findings

### 1. `ConspirateursMoveJump.equals` compares only start and end coords

**Severity:** Informational

```typescript
// Equality only needs to check the first and last coord
if (this.getStartingCoord().equals(other.getStartingCoord()) === false) return false;
if (this.getEndingCoord().equals(other.getEndingCoord()) === false) return false;
return true;
```

Two jumps with the same start and end but different intermediate paths are considered equal. This is intentional (the comment says so), and correct for game-state purposes since piece movement in Conspirateurs doesn't depend on which pieces were jumped over. However, it means distinct legal routes to the same endpoint are silently deduplicated by any `Set`-based move collection. This is not a bug given Conspirateurs rules but is worth verifying if rules ever add path-dependent semantics.

---

## No Other Issues Found

- `from` validates all jump segments are exactly distance 2 and aligned.
- `getJumpedOverCoords` safely calls `.get()` on directions that were already validated by `from`.
