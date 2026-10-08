# Review: `games/lodestone/LodestoneMove.ts`

## Summary

Move for Lodestone. One issue found: the custom decoder casts unvalidated JSON into the move's string-union fields and capture shape.

---

## Findings

### 1. Decoder does not validate direction, orientation, or capture fields

**Severity:** Medium

```typescript
return new LodestoneMove(Coord.encoder.decode(casted.coord),
                         casted.direction as LodestoneDirection,
                         casted.orientation as LodestoneOrientation,
                         casted.captures as LodestoneCaptures);
```

The decoder checks only that fields are present. It does not verify that `direction` is `'push' | 'pull'`, `orientation` is `'orthogonal' | 'diagonal'`, or that `captures` has numeric `top/bottom/left/right` values.

Downstream code branches on those string values. For example, any invalid direction other than `'pull'` is treated as push in `applyMoveWithoutPlacingCaptures`, and `LodestonePieceLodestone.of` indexes a nested map with the unvalidated direction/orientation. Malformed replay/network data can therefore create undefined board pieces or bypass intended validation instead of being rejected during decode.
