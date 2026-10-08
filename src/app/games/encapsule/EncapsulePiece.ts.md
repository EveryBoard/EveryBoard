# Review: `games/encapsule/EncapsulePiece.ts`

## Summary

Piece class for Encapsule. One missing issue found: the codec cannot round-trip `NONE`.

---

## Findings

### 1. `EncapsulePiece.encoder` uses `Player.encoder` for a `PlayerOrNone` owner

**Severity:** Medium

```typescript
public static encoder: Encoder<EncapsulePiece> = Encoder.tuple(
    [Encoder.identity<number>(), Player.encoder],
    (piece: EncapsulePiece) => [piece.size, piece.owner],
    (value: [number, PlayerOrNone]) => EncapsulePiece.ofSizeAndPlayer(value[0], value[1]),
);
```

`EncapsulePiece.NONE` has `owner === PlayerOrNone.NONE`. Encoding it produces an owner value of `2`, but `Player.encoder` only decodes players `0` and `1`. A board/state round-trip containing empty pieces can therefore fail during decode. The owner field should use `PlayerOrNone.encoder`.

---

## Notes

- `ofSizeAndPlayer` normalises to `NONE` whenever `player.isNone() || size === 0`, so no orphan zero-size pieces with a player.
- `equals` compares structurally (size + owner), correct since pieces are not singletons.
- `belongsTo` uses `===` on `PlayerOrNone`, safe because Player/PlayerOrNone values are singletons.
