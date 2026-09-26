# Review: `games/hive/HivePieceRules.ts`

## Summary

Piece-specific movement rules for Hive. Two medium findings.

---

## Findings

### 1. `HiveSpiderRules.prefixLegality` does not add the starting coord to `visited`, allowing circular moves

**Severity:** Medium

```typescript
let visited: CoordSet = new CoordSet();
// coords[0] (start) is never added to visited
for (let i: number = 1; i < coords.length; i++) {
    if (visited.contains(coords[i])) {
        return MGPValidation.failure(HiveFailure.SPIDER_CANNOT_BACKTRACK());
    }
    visited = visited.addElement(coords[i]);
}
```

A spider move `start → A → B → start` would not be caught: `start` is never in `visited`, so `coords[3] === start` passes the backtrack check. A zero-distance spider move is technically constructable via `HiveSpiderMove.ofCoords` (which bypasses the `start.equals(end)` check in `HiveCoordToCoordMove.from`).

In contrast, `getPotentialMoves` correctly includes the start in its backtrack filter:
```typescript
if (move.find((c: Coord) => coord.equals(c)) !== undefined) {
    return false;  // prevents returning to start
}
```

Fix: add `coords[0]` to `visited` before the loop, or initialize `visited` with `new CoordSet([coords[0]])`.

---

### 2. `HiveSoldierAntRules.pathExists` does not remove the ant from the state before pathfinding

**Severity:** Medium

```typescript
public pathExists(state: HiveState, start: Coord, end: Coord): boolean {
    // state still has ant at 'start'
    for (const neighbor of HexagonalUtils.getNeighbors(coord)) {
        const hasOccupiedNeighbors: boolean = state.getOccupiedNeighbors(neighbor).size() > 0;
        // ...
    }
}
```

`HiveSpiderRules` correctly removes the moving piece before pathfinding (`stateWithoutMovedSpider`), but `pathExists` uses the original state with the ant still at `start`. This causes two issues:

1. Cells adjacent to `start` that have only the ant as their occupied neighbor appear connected (allowing the ant to reach them), but once the ant actually leaves `start`, those cells have no occupied neighbors and would be disconnected.
2. Conversely, pathfinding from `start` succeeds even though the ant cannot physically be at `start` and another cell simultaneously.

The disconnection check in `HiveRules.isLegal` mitigates case 1 in practice, but the path validity is logically incorrect.

Fix: build a `stateWithoutMovedAnt` like the Spider rules do, and pass it to `pathExists`.

---

## No Other Issues Found

- `HiveBeetleRules`: correctly allows climbing onto any neighbor (occupied or empty), with no `checkEmptyDestination` call — beetles can stack.
- `HiveGrasshopperRules`: correctly validates straight-line jumps over contiguous occupied pieces. `getJumpedOverCoords()` is trusted to return intermediate coords.
- `HiveQueenBeeRules.getPotentialMoves`: only proposes empty neighbors (omitting the `canSlideBetweenNeighbors` check that `moveValidity` performs). This generates a superset of legal moves, which is acceptable for a move generator since `isLegal` will filter them.
- `HiveSpiderRules.getPotentialMoves`: correctly prevents backtracking to any previously visited coord including start, and deduplicates equivalent paths.
- `HiveSoldierAntRules.getPotentialMoves`: correctly iterates empty neighbors of all occupied spaces (excluding the ant's own position) as potential destinations.
