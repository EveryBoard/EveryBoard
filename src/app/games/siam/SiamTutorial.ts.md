# Review: `games/siam/SiamTutorial.ts`

## Summary

Tutorial for Siam. One medium bug: the victory step's board has too few mountains for the default config's win condition to trigger.

---

## Findings

### 1. Victory step board has 2 mountains but default config expects 3

**Severity:** Medium

```typescript
TutorialStep.fromMove(
    $localize`Victory`,
    ...,
    new SiamState([
        // Row 2: [M, U, l, _, d]  — 1 mountain
        // Row 4: [_, _, _, _, M]  — 1 mountain
        // Total: 2 mountains
    ], 0),
    [SiamMove.of(2, 2, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT)],
    TutorialStepMessage.CONGRATULATIONS_YOU_WON(), ...
)
```

`defaultConfig.numberOfBonusMountain = 2`, so the initial state should have 1 + 2 = 3 mountains for the win condition `nbMountain === config.numberOfBonusMountain` (i.e., "2 remain after 1 falls") to work. The custom board starts with only 2 mountains. After the push, 1 mountain remains → `1 === 2` is false → `getWinner` returns `NONE` → game continues rather than ending. The `CONGRATULATIONS_YOU_WON` message is shown by the tutorial step but the underlying game state is not a win. Fix: add a third mountain to the board, or use a config with `numberOfBonusMountain=1`.

---

## No Other Issues Found

- Step 2 (insert): turn=0 → ZERO (Dark); `(2,-1)` off-board insertion moving DOWN. ✓
- Step 3 (move): `u` at (2,4), move UP to (2,3) facing LEFT. Side-slip (direction ≠ current orientation). ✓
- Step 4 (move off board): DOWN from (2,4) → (2,5) off board; direction=landingOrientation as required. ✓
- Step 5 (push 1/2): push UP from (2,2)=u; row 0 has 1 pusher vs 1 resister → blocked; row 1 has 2 pushers vs 1 resister → possible; vertical push confirmed: force=1>0. ✓
- Step 6 (push 2/2): push RIGHT from (1,3); force = 1(r)+1(R)-1(L)-0.9(M)=0.1>0 → valid; winner is LIGHT_RIGHT at (3,3) → ONE wins → description "you lost" correct. ✓
