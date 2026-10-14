# Review: `games/coerceo/CoerceoState.ts`

## Summary
Coerceo state with triangular tile board and tile-removal mechanics. Two issues found.

---

## Findings

### 1. `getPiecesByFreedom` hardcodes 4 freedom bins — crashes if a piece has ≥ 4 neighbors

**Severity:** Medium

```typescript
const playersScores: PlayerNumberTable = PlayerNumberTable.of(
    [0, 0, 0, 0],
    [0, 0, 0, 0],
);
...
playersScores.add(owner, nbFreedom, 1);
```

The table has 4 columns (0–3 freedom degrees). In a triangular checkerboard, a piece can have up to 3 neighbors, so `nbFreedom` can be 0, 1, 2, or 3. With 4 bins (indices 0–3), this is just barely correct. However, if the board geometry allows more than 3 neighbors (e.g., interior triangular spaces with 3 neighbors), index 3 would be out of bounds. Needs verification that triangular checkerboard pieces have at most 3 neighbors — if so, 4 bins (0–3) is correct.

---

### 2. `isTileEmpty` asserts that `tileUpperLeft` is not `UNREACHABLE` — but `getPieceAt` can throw for out-of-bound coords

**Severity:** Informational

```typescript
Utils.assert(this.getPieceAt(tileUpperLeft) !== FourStatePiece.UNREACHABLE, ...);
```

If `tileUpperLeft` is outside the board bounds, `getPieceAt` itself could throw before the assertion fires. The intent is to guard against calling this on removed tiles, but the guard may fire before the relevant check.

---

## No Other Issues Found

- `isDeconnectable` correctly implements hole-count connectivity check.
- `removeTilesIfNeeded` correctly cascades tile removal.
- `capture` correctly increments the capturing player's capture count.
