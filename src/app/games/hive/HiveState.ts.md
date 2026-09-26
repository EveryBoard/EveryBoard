# Review: `games/hive/HiveState.ts`

## Summary

State for Hive. One medium finding: the queen bee coordinate cache is not adjusted when the parent applies a positional offset.

---

## Findings

### 1. Queen bee coordinates are not offset-adjusted in the constructor

**Severity:** Medium

```typescript
public constructor(pieces: ReversibleMap<Coord, HivePieceStack>,
                   public readonly remainingPieces: HiveRemainingPieces,
                   public readonly queenBees: MGPMap<Player, Coord>,
                   turn: number)
{
    super(pieces, turn);  // parent may normalize piece coordinates via an offset
    this.queenBees = queenBees.getCopy();
    for (const player of queenBees.getKeyList()) {
        // If the offset computed by the parent's constructor is not (0, 0),
        // We will need to adapt the position of the queen bees.
        // The position of the pieces has already been adapted by the parent's constructor
        const oldCoord: Coord = queenBees.get(player).get();
        this.queenBees.replace(player, oldCoord);  // stores the original, unadjusted coord
    }
    this.queenBees.makeImmutable();
}
```

The comment explicitly acknowledges that the parent `OpenHexagonalGameState` constructor may apply a non-zero offset to normalize piece coordinates, and that queen bee coords must be adjusted accordingly. However, the code reads `oldCoord` from the **original** `queenBees` parameter and writes it back unchanged — a no-op. No offset is ever applied.

If the parent applies a non-zero offset (shifting all `this.pieces` keys), then `this.queenBees` retains pre-offset coordinates that no longer match any key in `this.pieces`. Calls to `queenBeeLocation(player)` would return stale coordinates, breaking:
- Victory detection (`getGameStatus` checking if the queen is surrounded)
- Any logic reading `queenBeeLocation` against the actual board

The fix would be to apply the parent's offset to each queen bee coordinate. The exact API depends on how `OpenHexagonalGameState` exposes its offset.

---

## No Other Issues Found

- `HiveStateUpdate.setAt` correctly handles beetles stacking on queen bees: it removes the queen from the cache and then re-adds it at the same coord if the new stack still contains a queen bee.
- `HiveRemainingPieces.getInitial` correctly initializes counts (1 QueenBee, 2 Beetles, 2 Spiders, 3 Grasshoppers, 3 SoldierAnts per player).
- `HiveStateUpdate.increaseTurnAndFinalizeUpdate` correctly bumps turn by 1.
- `fromRepresentation` correctly iterates all pieces to build the queen bee cache and remaining pieces.
