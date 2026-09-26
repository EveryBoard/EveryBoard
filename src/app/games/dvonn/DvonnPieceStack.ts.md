# Review: `games/dvonn/DvonnPieceStack.ts`

## Summary
Stack type for Dvonn (owner, size, source-marker). One medium codec issue plus one informational finding.

---

## Findings

### 1. `encoder` uses `Player.encoder` for a `PlayerOrNone` owner

**Severity:** Medium

```typescript
public static encoder: Encoder<DvonnPieceStack> = Encoder.tuple(
    [Encoder.identity<boolean>(), Player.encoder, Encoder.identity<number>()],
    (stack: DvonnPieceStack): [boolean, PlayerOrNone, number] => [stack.source, stack.owner, stack.size],
    ...
);
```

Several stack singletons have `owner === PlayerOrNone.NONE`: `EMPTY`, `UNREACHABLE`, and `SOURCE`. Encoding those stacks produces owner value `2`, but `Player.encoder` only decodes players `0` and `1`. State/replay round-trips containing empty or source-only stacks can therefore fail during decode. This field should use `PlayerOrNone.encoder`.

### 2. `UNREACHABLE.hasPieces()` returns `true`

**Severity:** Informational

`UNREACHABLE` has `size = -1`. `isEmpty()` checks `size === 0`, so `UNREACHABLE.isEmpty()` is `false` and `UNREACHABLE.hasPieces()` is `true`. Code that uses `hasPieces()` to test whether a cell is occupied would be incorrect for UNREACHABLE cells. Callers need to check for UNREACHABLE separately before calling `hasPieces()`.

---

## No Other Issues Found

- `append` correctly propagates the `source` flag using OR.
