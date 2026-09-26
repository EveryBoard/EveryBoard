# Review: `games/mancala/common/MancalaComponent.ts`

## Summary

Base component for Mancala family. One medium finding and two cosmetic notes.

---

## Findings

### 1. `showSeedBySeed` hardcodes capturable value 4 — breaks animation for other variants

**Severity:** Medium (display only, not rules)

```typescript
// line 236
mustDoOneMoreLap = lastHouseContent !== 1 && lastHouseContent !== 4;
```

This hardcodes that a lap ends when the last house has 1 seed (was empty) or 4 seeds (capturable). This matches Ba-awa's capture rule (`capturableValues = [4]`), but if `continueLapUntilCaptureOrEmptyHouse` is ever enabled for a variant with different capturable values, the animation would continue laps it shouldn't (or stop laps prematurely). The rules engine uses `this.capturableValues` properly; the animation should do the same via `this.rules.isHouseCapturableOrEmpty(coord, state)`.

---

## Notes

### `showLastMove` monsoon always credits Player.ZERO

```typescript
// line 83
captureResult = this.rules.monsoon(Player.ZERO, captureResult); // Who captures here is not important
```

For display purposes this is mostly fine (the board is empty either way), but if any downstream display logic reads `captureResult.resultingState.scores` to show which player won the monsoon seeds, it would always show Player.ZERO benefiting. Cosmetic.

### `constructedState` uninitialized at declaration

`public constructedState: MancalaState;` (line 44) has no initializer. It is set by `changeVisibleState` which is called from `updateBoard`. Accessing it before `updateBoard` runs would yield `undefined`. TypeScript does not flag this. Same pattern as other components — low risk in practice.

---

## No Other Issues Found

- `onLegalClick` row check `Player.of(y) === getCurrentPlayer()` correctly rejects the opponent's row — works because Player ZERO plays row 1 and Player ONE plays row 0. ✓
- `isDistributionLegal` / `continueMoveConstruction` correctly handle the Kalah bonus-turn flow: legal if distributing, or delegate to `isLegal` if the player is starving after a store drop. ✓
- `getStoreContent` adds `droppedInStore` to scores during animation so the store counter updates in real time. ✓
- `getPreviousStableState` correctly distinguishes between opponent-animation mode (returns grandparent state) and normal display (returns current or parent state). ✓
- `cancelMoveAttempt` correctly resets all transient state. ✓
