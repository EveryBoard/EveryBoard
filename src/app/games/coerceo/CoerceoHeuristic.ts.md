# Review: `games/coerceo/CoerceoHeuristic.ts`

## Summary
Abstract heuristic base for Coerceo. One informational finding.

---

## Findings

### 1. `getPlayerPiecesScore` applies `safeScore` to 0-freedom pieces

**Severity:** Informational

```typescript
return (safeScore * piecesScores[0]) +
    (capturableScore * piecesScores[1]) +
    (safeScore * piecesScores[2]) +
    (safeScore * piecesScores[3]);
```

Pieces with 0 freedoms (no empty adjacent triangles) receive the highest weight (`safeScore = 3`), while pieces with 1 freedom receive the lowest (`capturableScore = 1`). This ordering is surprising — if 0 freedoms means fully surrounded, those pieces would be in equal or greater danger than 1-freedom pieces. In practice, 0-freedom pieces may never appear in valid game states (they would be captured immediately), so `piecesScores[0]` is always 0 and the weight is irrelevant. Still, the intent is unclear and would silently produce a wrong score if 0-freedom pieces could ever exist.

---

## No Other Issues Found

- `getPiecesFreedomScore` correctly reads both players' bins.
- `getPiecesMap` correctly iterates all coords and separates by player.
