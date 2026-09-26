# Review: `games/epaminondas/EpaminondasPieceThenRowDominationThenAlignmentThenRowPresenceHeuristic.ts`

## Summary

Multi-metric heuristic for Epaminondas. One medium finding.

---

## Findings

### 1. Alignment metric only counts upward chains for both players

**Severity:** Medium

```typescript
for (const dir of [Ordinal.UP_LEFT, Ordinal.UP, Ordinal.UP_RIGHT]) {
    let neighbor: Coord = coord.getNext(dir, 1);
    while (node.gameState.hasPieceAt(neighbor, player)) {
        alignement += mod;
        neighbor = neighbor.getNext(dir, 1);
    }
}
```

Both ZERO and ONE's phalanx depth is measured in the same three upward directions. But Player.ZERO advances toward row 0 (UP) while Player.ONE advances toward the last row (DOWN). ONE's forward-facing phalanxes — those oriented `DOWN_LEFT`, `DOWN`, `DOWN_RIGHT` — are never counted. As a result:

- ZERO's forward phalanxes add to `alignement` (correct)
- ONE's forward phalanxes are ignored
- ONE's *backward* phalanxes subtract from `alignement` (incorrect reward signal for ONE)

The downward directions should be included for ONE (or both directions for both players):

```typescript
const dirs: Ordinal[] = player === Player.ZERO
    ? [Ordinal.UP_LEFT, Ordinal.UP, Ordinal.UP_RIGHT]
    : [Ordinal.DOWN_LEFT, Ordinal.DOWN, Ordinal.DOWN_RIGHT];
```

---

## No Other Issues Found

- `rowDomination`: `Math.abs(row) / row` correctly yields ±1 per dominated row.
- `wasPresent.put(player, mod)` is idempotent for multiple pieces of the same player in a row (overwrite with same value), correctly tracking binary per-row presence as a score modifier.
- `BoardValue.multiMetric` ordering (pieces → rowDomination → alignement → presence) ensures higher-priority metrics dominate lower-priority ones.
