# Review: `games/pentago/PentagoMoveGenerator.ts`

## Summary

Move generator for Pentago. One medium finding: anti-clockwise rotation is not offered for blocks that were neutral before the drop but deneutralized by it.

---

## Findings

### 1. `getLegalRotations` skips anti-clockwise for newly deneutralized blocks

**Severity:** Medium (AI move quality)

```typescript
if (blockNeutralBeforeDrop.includes(blockIndex)) { // just deneutralized
    if (mustRotate) {
        legalRotations.push([blockIndex, true]); // only CW offered
    }
} else {
    legalRotations.push([blockIndex, true], [blockIndex, false]); // both directions
}
```

When a block was neutral before the drop (CW == CCW for the pre-drop state), the drop deneutralizes it. After the drop, the block is asymmetric and CW ≠ CCW. The generator only offers `true` (clockwise), so the AI never considers anti-clockwise rotations for these blocks. This can cause the AI to miss valid and potentially winning moves. Fix: offer both directions: `legalRotations.push([blockIndex, true], [blockIndex, false])` in the "just deneutralized" branch as well.

---

## Notes

- First-turn symmetry pruning (6 canonical moves) is correct: the board's 4-fold symmetry makes all other first-turn placements equivalent. ✓
- `preDropNeutralBlocks` is correctly sampled from the state before the drop (line 21), not after. ✓
- `mustRotate` condition (no neutral blocks after drop) is correctly derived from `stateAfterDrop`. ✓
- Non-neutral blocks (neither newly deneutralized nor newly anything) correctly offer both CW and CCW. ✓
