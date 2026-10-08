# Review: `games/pentago/PentagoRules.ts`

## Summary

Rules for Pentago. One medium finding (missing bounds check on block index), one low finding (subVictory mutation bug for 6-in-a-row).

---

## Findings

### 1. `isLegal` does not validate `blockTurned` is in range 0–3

**Severity:** Medium

```typescript
if (move.blockTurned.isPresent()) {
    const blockTurned: number = move.blockTurned.get();
    if (postDropState.neutralBlocks.includes(blockTurned)) { ... }
}
```

`PentagoMove.withRotation` asserts `0 <= blockTurned <= 3`, but `PentagoMove.of(coord, MGPOptional.of(N), true)` does not. If a replay/network delivers `blockTurned >= 4`, `neutralBlocks.includes(N)` returns `false` and the move passes validation. `getBlockCenter(N)` then uses `N % 2` and `N < 2`, causing out-of-range indices to alias existing block centers silently. A simple `if (move.blockTurned.get() > 3) return MGPValidation.failure(...)` would fix this.

---

### 2. `subVictory` is mutated across both forward and backward win-check branches

**Severity:** Low (visual highlight bug only; game-over detection is correct)

```typescript
if (fourAligned) {
    if (state.getPieceAt(testedCoord) === firstValue) {
        subVictory.push(testedCoord);                        // subVictory grows to 5
        victoryCoords = victoryCoords.concat(subVictory);
    }
    if (maybeVictory[2]) {
        const coordZero = maybeVictory[0].getPrevious(maybeVictory[1], 1);
        if (state.getPieceAt(coordZero) === firstValue) {
            subVictory.push(coordZero);                      // subVictory grows to 6
            victoryCoords = victoryCoords.concat(subVictory); // 6-item chunk added
        }
    }
}
```

When a player has 6-in-a-row (all cells filled in a row/column/long diagonal), both branches fire. `subVictory` is 5 items after the first branch and 6 items after the second. `victoryCoords` ends up with a 5-item chunk followed by a 6-item chunk (11 total). `getGameStatus` iterates with stride 5, so it reads indices 0, 5, 10 — all still belong to the winning player — game detection is correct. However, `getVictoryCoords` returns inconsistent-sized groups, causing the highlighting component to receive duplicate/extra winning cells. Fix: use a fresh `subVictory` copy for the lookBothWays branch.

---

## No Other Issues Found

- `VICTORY_SOURCE` correctly covers all 5-in-a-row windows on a 6×6 board: 4 short diagonals (lookBothWays=false), 2 long diagonals, 6 columns, and 6 rows (all three with lookBothWays=true). ✓
- `isLegal` correctly handles all four cases: (no neutral blocks + no rotation → FAIL), (no neutral blocks + rotation → OK), (neutral blocks + no rotation → OK), (neutral blocks + rotate neutral block → FAIL). ✓
- `getGameStatus` correctly detects simultaneous wins (DRAW) via `victoryFound` map. ✓
- Full-board draw detected via `turn === SIZE * SIZE`. ✓
