# Review: `jscaip/AI/AlignmentHeuristic.ts`

## Summary
Well-structured heuristic template. One design concern around `PRE_VICTORY` scoring, and an assertion that will fault at runtime if `VICTORY` status is passed to `toBoardValue`.

---

## Findings

### 1. `toBoardValue` asserts (crashes) if called with `VICTORY` status

**Severity:** Medium

```typescript
public toBoardValue(turn: number): BoardValue {
    if (this === AlignmentStatus.NOTHING) {
        return BoardValue.of(0);
    } else {
        Utils.assert(this === AlignmentStatus.PRE_VICTORY, 'alignment status can only be pre-victory or default');
        // ...
    }
}
```

The method handles `NOTHING` and `PRE_VICTORY` but asserts-fails for `VICTORY`. The comment "(only for heuristics, will not consider victories)" documents the intent, but nothing prevents a caller from invoking `AlignmentStatus.VICTORY.toBoardValue(turn)` — which immediately throws. No guard, no early return for `VICTORY`.

**Recommendation:** Add an explicit guard for `VICTORY` (return `BoardValue.of(player.getVictoryValue())` or throw a more descriptive error), instead of letting the assertion describe the problem after the fact.

---

### 2. `PRE_VICTORY` board value is identical to victory value due to `Infinity - 1 = Infinity`

**Severity:** Medium (linked to `BoardValue.ts` finding)

```typescript
const player: Player = Player.of(turn % 2);
return BoardValue.of(player.getPreVictory());
```

If `Player.getPreVictory()` returns `Number.POSITIVE_INFINITY - 1` (for Player ONE) or `Number.NEGATIVE_INFINITY + 1` (for Player ZERO), those values equal `±Infinity` in JavaScript — identical to the true victory value. The alpha-beta search therefore cannot distinguish "one move from winning" from "already won," which may cause incorrect pruning when a subgame ends immediately after a pre-victory position.

This is a consequence of the bug already documented in `BoardValue.ts.md` (`isPreVictory` is equivalent to `isVictory`).

---

### 3. `calculateBoardValue` accumulates `sum` even after switching to `searchVictoryOnly`

**Severity:** Informational

```typescript
if (boardInfo.status === AlignmentStatus.PRE_VICTORY) {
    newBoardInfo = this.searchVictoryOnly(victorySource, move, state);
} else {
    newBoardInfo = this.getBoardInfo(victorySource, move, state, boardInfo);
}
// ...
boardInfo.sum = boardInfo.sum + newBoardInfo.sum;
```

Once `PRE_VICTORY` is reached, `searchVictoryOnly` is called for all subsequent sources, but its `newBoardInfo.sum` is still added to `boardInfo.sum`. If `searchVictoryOnly` returns non-zero `sum` values, the accumulated score becomes a mix of a pre-victory run and partial `getBoardInfo` runs — a subtle inconsistency. If `searchVictoryOnly` always returns `sum: 0`, this is harmless.

---

### 4. Only the first `PRE_VICTORY` source is recorded in `boardInfo.preVictory`

**Severity:** Informational

```typescript
if (boardInfo.preVictory.isAbsent()) {
    boardInfo.preVictory = newBoardInfo.preVictory;
}
```

Subsequent pre-victory sources are silently discarded. This is acceptable for a single-threat heuristic but may miss double-threat (fork) positions. No documentation explains this limitation.

---

## No Other Issues Found

- `AlignmentStatus` uses a private constructor with static singleton instances — reference equality (`this ===`) in `toBoardValue` is correct.
- The abstract method protocol (`startSearchingVictorySources` / `hasNextVictorySource` / `getNextVictorySource`) is a clean iterator pattern over victory sources.
- Early return on `VICTORY` in the main loop correctly short-circuits the remaining sources.
