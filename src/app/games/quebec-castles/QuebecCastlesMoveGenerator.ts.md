# Review: `games/quebec-castles/QuebecCastlesMoveGenerator.ts`

## Summary

Move generator for Quebec Castles. One medium finding about multi-drop move enumeration; one note on a potential empty-return.

---

## Findings

### 1. Multi-drop PIECE_BY_PIECE mode generates only one move instead of all combinations

**Severity:** Medium

When `dropMode === 'PIECE_BY_PIECE'` and `nbOfDropsAwaited > 1`, the generator accumulates valid coords sequentially and returns them as a single fixed drop move once count is reached:

```typescript
} else {
    coords.push(dropCoord);
    if (nbOfDropsAwaited === coords.length) {
        return [QuebecCastlesDrop.of(coords)];  // only the first N valid coords
    }
}
```

This produces exactly one move (the first `nbOfDropsAwaited` valid coords in iteration order) rather than all C(validCoords, nbOfDropsAwaited) combinations. If `nbOfDropsAwaited > 1` ever occurs in PIECE_BY_PIECE mode (e.g., simultaneous castle + piece placement), the AI would miss all other valid placements.

Additionally, if `validDropCoords.length < nbOfDropsAwaited`, the function returns `moves` (empty array) — the AI has no moves, which could stall the game.

---

## Notes

### `getDropMoves` returns empty for unreachable multi-drop case

If valid drop coords are fewer than `nbOfDropsAwaited` in the PIECE_BY_PIECE branch, `moves` is returned empty. This is safe as long as `getExpectedDropsThisTurn` never returns a value exceeding available valid coords, but there is no guard.

---

## No Other Issues Found

- `getListMoves` correctly dispatches to `getDropMoves` or `getNormalMoves` via `isDropPhase`. ✓
- `getDropMoves` single-drop (PIECE_BY_PIECE, nbOfDropsAwaited=1): each valid empty non-castle coord becomes its own move. ✓
- `getDropMoves` ALL_AT_ONCE non-castle phase: delegates to `getInitialCoords` for the canonical placement. ✓
- `getNormalMoves`: iterates all coords owned by current player and collects `getPossibleMovesFor` results. ✓
