# Review: `games/mancala/ba-awa/BaAwaRules.ts`

## Summary

Rules for Ba-awa. The previously suspicious monsoon and capture-on-the-go behaviors are covered by tests and appear intentional. One misleading variable name remains.

---

## Findings

### 1. `mustMonsoon` always awards final monsoon seeds to `Player.ZERO` regardless of turn

**Status:** Confirmed behavior, not a proven bug

```typescript
public override mustMonsoon(postCaptureState: MancalaState, config: BaAwaConfig): Player[] {
    ...
    if (postCaptureState.getTotalRemainingSeeds() <= 8) {
        if (config.splitFinalSeedsEvenly) {
            return [Player.ZERO, Player.ONE];
        } else {
            return [Player.ZERO];  // always Player.ZERO, regardless of whose turn it is
        }
    }
}
```

When total seeds <= 8 and `splitFinalSeedsEvenly` is false, all remaining seeds are awarded to `Player.ZERO` via `monsoon(Player.ZERO, ...)`. This looked suspicious, but `BaAwaRules.spec.ts` explicitly tests both Player.ZERO's turn and Player.ONE's turn and expects Player.ZERO to receive the final monsoon in both cases.

This should not be treated as a confirmed bug unless the external Ba-awa rules specification says final seeds should go to the mover instead.

### 2. `getDropResult`: mid-distribution captures credited to house owner, not current player

**Status:** Confirmed behavior, not a proven bug

```typescript
const houseOwner: Player = Player.of(coord.y).getOpponent();
resultingState = resultingState.capture(houseOwner, coord);
```

When a seed lands mid-distribution and makes the count 4, the captured seeds are given to the **house owner** (`row 0 -> Player.ONE`, `row 1 -> Player.ZERO`), not necessarily to the distributing player. This is covered by tests named "capture-on-the-go for opponent" and "capture-on-the-go for player", including multiple-capture variants, so the implementation matches the current test suite.

This should not be changed without checking the external Ba-awa rules specification.

---

## Notes

### `previousValue` is the post-feed value, not the pre-feed value

```typescript
let resultingState: MancalaState = state.feed(coord);
const previousValue: number = resultingState.getPieceAt(coord); // AFTER feed
if (previousValue === 4 && seedsInHand > 1) { ... }
```

`previousValue` is misleadingly named — it holds the house content **after** the seed is dropped. The check `=== 4` is correct (captures when the house now contains exactly 4 seeds), but the name implies a before-feed value.

---

## No Other Issues Found

- `applyCapture` correctly fires only when the last drop is NOT a store and the final house has exactly 4 seeds. ✓
- `continueLapUntilCaptureOrEmptyHouse = true` for Ba-awa — consistent with the 4-capture rule (matches the hardcoded `!== 4` animation check in `MancalaComponent`). ✓
- `splitFinalSeedsEvenly` preset correctly returns `[Player.ZERO, Player.ONE]` → triggers `sharedMonsoon`. ✓
