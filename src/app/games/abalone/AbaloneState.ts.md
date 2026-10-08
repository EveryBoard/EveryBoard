# Review: `games/abalone/AbaloneState.ts`

## Summary
State class for Abalone with score tracking. One inherited issue.

---

## Findings

### 1. `PlayerNumberMap.add` returns old value (previously identified bug)

**Severity:** Informational

```typescript
scores.add(owner.getOpponent(), -1);
```

As noted in `PlayerMap.ts.md`, `PlayerNumberMap.add` has a bug where it returns the old value instead of the new value. Here the return value is discarded, so this doesn't cause incorrect behavior in `getScores()` — the internal map state is correctly updated despite the return value bug.

---

## No Other Issues Found

- `getScores()` correctly counts remaining pieces per player by iterating all cells and subtracting from a starting count of 14.
