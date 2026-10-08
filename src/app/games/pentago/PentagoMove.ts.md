# Review: `games/pentago/PentagoMove.ts`

## Summary

Move encoding for Pentago. One issue found: decoded moves bypass the block-index validation used by the public rotation factory.

---

## Findings

### 1. `encoder` decodes unchecked `blockTurned` values

**Severity:** Medium

```typescript
public static of(coord: Coord, blockTurned: MGPOptional<number>, turnedClockwise: boolean): PentagoMove {
    return new PentagoMove(coord.x, coord.y, blockTurned, turnedClockwise);
}
```

`PentagoMove.withRotation` asserts `0 <= blockTurned && blockTurned <= 3`, but the encoder decodes through `PentagoMove.of`, which does not perform that check. A replay/network move can therefore contain `blockTurned` values outside `0..3`.

The constructor only validates the drop coordinate. Downstream, `PentagoState.getBlockCenter(blockIndex)` aliases out-of-range block numbers to existing centers using `% 2` and `< 2`, so malformed moves can rotate the wrong block instead of being rejected.
