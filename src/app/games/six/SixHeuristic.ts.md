# Review: `games/six/SixHeuristic.ts`

## Summary

Heuristic for Six. One high-severity bug: `searchVictoryOnlyForLine` has an off-by-one in the direction-flip backtrack that produces false positive VICTORY results.

---

## Findings

### 1. `searchVictoryOnlyForLine`: off-by-one in backtrack — false positive VICTORY

**Severity:** High

```typescript
} else {
    twoDirectionCovered = true;
    dir = dir.getOpposite();
    testCoord = testCoord.getNext(dir, victory.length - 1);  // BUG: should be victory.length
}
testCoord = testCoord.getNext(dir, 1);
```

**Root cause.** When blocked at coord `P = lastDrop + oldDir × victory.length`, the code repositions `testCoord` so that the *next* cell tested (after the unconditional `testCoord.getNext(dir, 1)` at the loop end) is the first cell on the opposite side of `lastDrop`.

Required formula: `P + (-oldDir) × k` such that `P + (-oldDir)×(k+1) = lastDrop + (-oldDir)`, i.e. **k = victory.length**. The code uses `k = victory.length - 1`, so the combined two steps land at `lastDrop` itself instead of `lastDrop + (-oldDir)`.

**Concrete trace** (lastDrop=(0,0) going RIGHT, pieces at R1=(1,0), R2=(2,0), blocked at R3=(3,0)):

| Step | action | victory |
|------|--------|---------|
| init | victory = [(0,0)] | length=1 |
| R1 | push | [(0,0),(1,0)] |
| R2 | push | [(0,0),(1,0),(2,0)] |
| R3 | blocked → flip, testCoord = R3+LEFT×**2** = (1,0) | |
| end of loop | testCoord = (1,0)+LEFT = (0,0) | |
| **(0,0) again** | **push duplicate** | [(0,0),(1,0),(2,0),(0,0)] |
| L1=(-1,0) | push | length=5 |
| L2=(-2,0) | push | length=6 → **VICTORY reported** |

Only 5 unique pieces exist `{L2,L1,center,R1,R2}` — no actual 6-in-a-row. The fix: replace `victory.length - 1` with `victory.length`:

```typescript
testCoord = testCoord.getNext(dir, victory.length);  // skip past lastDrop
```

**Note:** `SixRules.searchVictoryOnlyForLine` uses `victory.length` (the correct value) at line 325, so actual game win detection is unaffected. The bug is isolated to the heuristic, degrading AI evaluation quality without corrupting game outcomes.

---

## Notes

### `currentVictorySource` is a public mutable field

```typescript
public currentVictorySource: SixVictorySource;
```

Accessed directly by `SixFilteredMoveGenerator`. Design smell: couples the filtered generator tightly to the heuristic's internal iteration state. Since each caller owns its own `SixHeuristic` instance, no data corruption occurs.

### `getBoardInfoResult` VICTORY branch is unreachable for LINE windows

```typescript
} else if (subSum === 5) {
    return { status: AlignmentStatus.VICTORY, ... };
}
```

Called from `getBoardInfoForLine` where windows are 6 cells wide and each cell scores opponent=-7, empty=0.16, player=1. A sum of exactly 5 is impossible (6 player pieces = 6, 5 player+1 empty = 5.16). LINE VICTORY is detected by `searchVictoryOnly`, not `getBoardInfo`. Dead code, but harmless.

---

## No Other Issues Found

- `getBoardValue`: uses `previousPlayer` for victory/pre-victory values; in movement phase uses piece count instead of alignment score. ✓
- `startSearchingVictorySources` / `hasNextVictorySource` / `getNextVictorySource`: iteration over LINE(1,3,5), TRIANGLE_CORNER(0–5), TRIANGLE_EDGE(0–5), CIRCLE(0–5) is correct; terminal condition CIRCLE+index=5 is right. ✓
- `searchVictoryOnlyForCircle`: rotates direction by one each step; 6-cell ring detection. ✓
- `searchVictoryOnlyForTriangleCorner` / `TriangleEdge`: turn-timing differs (corner turns at even-length, edge turns after push); both correct. ✓
- `getBoardInfoForCircle` / `TriangleCorner` / `TriangleEdge`: scores 5 non-lastDrop cells; `subSum===4.16` → PRE_VICTORY, `subSum===5` → VICTORY. ✓
- `getBoardInfoForLine`: sliding 6-cell window; `subSum===5.16` → PRE_VICTORY; `Math.max` tracks the best window. ✓
- `updateEncounterAndReturnLastEmpty`: opponent=-7 (dominates any positive sum), empty=0.16, player=1. ✓
