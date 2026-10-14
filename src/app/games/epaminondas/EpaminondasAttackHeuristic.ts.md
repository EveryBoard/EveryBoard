# Review: `games/epaminondas/EpaminondasAttackHeuristic.ts`

## Summary

Attack heuristic for Epaminondas. One informational finding.

---

## Findings

### 1. `getCenter` rewards distance from center, not proximity

**Severity:** Informational

```typescript
score += owner.getScoreModifier() * Math.abs(coordAndContent.coord.x - cx);
```

This adds a positive value for ZERO pieces that are far from the center column, and a negative value for ONE pieces far from center. That means both players are rewarded for spreading to the edges, not the center. A heuristic named "center" typically rewards center proximity (closer = better). If the intent is "column-spread / flank control", the name is misleading. If center control is the intent, the sign should be negated:

```typescript
score -= owner.getScoreModifier() * Math.abs(coordAndContent.coord.x - cx);
```

---

## No Other Issues Found

- `getTerritory`'s (dx=0,dy=0) iteration at the center increments score and is immediately corrected by `score -= owner.getScoreModifier()` on line 67, netting zero contribution from the self-cell.
- `getMobility`'s squared step-size scoring correctly rewards highly mobile phalanxes over short ones.
- `getDefense` and `getOffense` correctly check back-row occupancy using direct `===` comparison against `Player` singletons.
