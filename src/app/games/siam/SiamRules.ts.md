# Review: `games/siam/SiamRules.ts`

## Summary

Rules for Siam. One medium bug: config mutation in `getInitialState`. The push logic is complex but correct.

---

## Findings

### 1. `getInitialState` mutates the `config` parameter

**Severity:** Medium

```typescript
public override getInitialState(config: SiamConfig): SiamState {
    // ...
    config.numberOfBonusMountain = Math.min(config.numberOfBonusMountain, config.width - 1);
```

The function writes to `config.numberOfBonusMountain`, permanently altering the caller's config object. If the same config instance is reused (e.g., for game restarts or display purposes), the clamped value persists. Fix: use a local variable `const cappedBonusMountains = Math.min(config.numberOfBonusMountain, config.width - 1)` and reference that variable instead.

---

## No Other Issues Found

- `isLegalForwarding`: force accumulation (+1 pusher, -1 resister, -0.9 mountain); loop exits when off-board, empty, or force ≤ 0; final off-board check adds last piece's force. ✓
- `isStraight`: prevents non-aligned pushes when landing cell is occupied. ✓
- `isLegalRotation`: rejects rotation to same direction. ✓
- `getWinner`: `nbMountain === config.numberOfBonusMountain` means exactly one mountain was pushed off (initial = numberOfBonusMountain + 1). ✓
- `getPusher`: uses `state.getCurrentOpponent()` for insertion (= who just moved, since turn was incremented). ✓
- `getInsertions`: non-corner edges then corners cover all edge positions. ✓
- `getInsertionsAt`: `entrance = coord.getPrevious(direction)` gives the off-board insertion coord; asserts move validity. ✓
- Config validator: `numberOfBonusMountain` range [0, 98] (comment notes -1 for the always-present center mountain). ✓
