# Review: `games/hexodia/HexodiaMoveGenerator.ts`

## Summary

Move generator for Hexodia. One medium finding.

---

## Findings

### 1. `getListDrops` hardcodes 2 drops, ignoring the `numberOfDrops` config

**Severity:** Medium

```typescript
private getListDrops(node: HexodiaNode): HexodiaMove[] {
    // iterates all (firstCoord, secondCoord) pairs — always 2 drops
}
```

The function signature does not accept `config`, and the loop always generates moves with exactly 2 coords. The config exposes `numberOfDrops` with a validator range of 1–99. If the user configures `numberOfDrops = 1`, the AI generates 2-coord moves that will fail `isLegal` (which asserts `numberOfDrops === requiredDrop`). If the user configures `numberOfDrops = 3`, the AI generates only 2-coord moves, missing the third drop entirely.

Fix: pass `config` into `getListDrops` and generalize the loop to enumerate all N-coord combinations for `numberOfDrops = N`.

---

## No Other Issues Found

- `Set(moves).toList()` correctly deduplicates symmetric 2-coord moves since `HexodiaMove.equals` uses `CoordSet` equality (order-independent).
- `getFirstMove` limiting first move to center only is an intentional branching-factor reduction.
- `getUsefulCoordsTable` correctly marks only cells adjacent to occupied pieces as "useful," pruning the search space without losing winning moves (a winning line must be adjacent to existing pieces).
- The rectangular ±1 bounding box in `addNeighboringCoord` is a superset of true hexagonal adjacency — it may include some diagonal-only neighbors that aren't true hex neighbors, but this only adds extra candidate moves without missing any, which is acceptable for the AI heuristic.
