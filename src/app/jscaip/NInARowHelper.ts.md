# Review: `jscaip/NInARowHelper.ts`

## Summary
Solid heuristic. One latent crash if `directions` array omits an opposite, and one unsafe cast that is saved by runtime behaviour.

---

## Findings

### 1. `getScoreFromDirectionAlliesAndFreeSpaces` crashes if `directions` lacks an opposite pair member

**Severity:** Medium

```typescript
const oppositeDirectionAllies: number = alliesByDirs.get(dir.getOpposite()).get();
```

This assumes `dir.getOpposite()` was also present in `this.directions`, so it was computed and stored in `alliesByDirs`. If a caller passes a `directions` array that omits one member of an opposite pair (e.g., passes only `[Ordinal.UP]` without `[Ordinal.DOWN]`), `alliesByDirs.get(Ordinal.DOWN)` returns `MGPOptional.empty()` and `.get()` throws.

For `NInARowHelper` (using `Ordinal.ORDINALS`, which includes all 8 directions) this never fires. But `AbstractNInARowHelper` is public and takes arbitrary `directions`.

**Recommendation:** Add a constructor assertion: every direction's opposite must also be in `directions`, or document the requirement explicitly.

---

### 2. `getSquareScore` `as Player` cast bypasses the null-check intent

**Severity:** Low (saved at runtime, confusing at compile time)

```typescript
const ally: Player = this.getOwner(piece, state) as Player;
Utils.assert(ally.isPlayer(), 'getSquareScore should not be called with PlayerOrNone.NONE piece');
```

The `as Player` cast makes TypeScript treat the value as `Player`, but if `getOwner` returns `PlayerNone`, the runtime value is still `PlayerNone`. The subsequent `ally.isPlayer()` calls `PlayerNone.isPlayer()` which returns `false`, triggering the assertion correctly. However, the cast is misleading — it implies the value is already confirmed to be a `Player`, making the assert look redundant to a reader.

**Recommendation:** Remove the cast: `const allyOrNone: PlayerOrNone = this.getOwner(piece, state); Utils.assert(allyOrNone.isPlayer(), ...); const ally: Player = allyOrNone as Player;`

---

### 3. `getBoardValue` returns on the first victory found, potentially missing a draw

**Severity:** Low (design note)

If Player.ZERO has a victory and the board is iterated in row-major order, the method returns immediately on the first winning coord. If both players simultaneously have winning lines (can happen in games like Pente where the last move creates lines for both), the first found is returned — potentially declaring the wrong winner. The game's `Rules.getGameStatus` is responsible for correctness; `getBoardValue` is a heuristic only, but this is worth noting.

---

## No Other Issues Found

- `doubleDirections` deduplication using `getOpposite()` is correct because `Direction.getOpposite()` returns singletons (identity-comparable).
- `getNumberOfFreeSpacesAndAllies` correctly stops at opponents and handles the `allAlliesAreSideBySide` flag.
- The score formula `2 + lineFreeSpaces - N` produces positive values only when a line is still viable.
