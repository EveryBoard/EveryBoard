# Review: `games/tafl/TaflEscapeThenPieceThenControlHeuristic.ts`

## Summary

Escape + piece + control heuristic for Tafl. One medium-high bug: the "can't escape" sentinel breaks when the defender is Player.ONE, swapping the meanings of "1-step escape" and "unreachable escape."

---

## Findings

### 1. `getStepForEscapeMetric`: sentinel `-1` collides with valid escape distance when defender = Player.ONE

**Severity:** Medium-High

```typescript
const stepForEscape: number = this.getStepForEscape(state) * defender.getScoreModifier();
if (stepForEscape === -1) {
    return defender.getOpponent().getPreVictory();
} else {
    return -1 * stepForEscape;
}
```

`getStepForEscape` returns the number of steps to the nearest corner, or `-1` (via `.getOrElse(-1)`) when no escape path exists. After multiplying by `defender.getScoreModifier()`:

| defender | raw steps | stepForEscape | check fires? | returned value |
|----------|-----------|---------------|-------------|----------------|
| ZERO (+1) | -1 (none) | -1 | ✓ | ONE.getPreVictory() (very negative = correct: bad for ZERO) |
| ZERO (+1) | 1 (near) | 1 | ✗ | -1 (mildly negative = correct) |
| ONE (-1) | -1 (none) | +1 | ✗ | -1 **(wrong: treated as 1-step escape)** |
| ONE (-1) | 1 (near) | -1 | ✓ | ZERO.getPreVictory() **(wrong: very good for ZERO/invader)** |

When defender = Player.ONE (e.g., Tablut with `invaderStarts = true`):
- An unreachable escape (-1 raw) becomes +1 after multiplication, bypasses the sentinel, and is scored as a "mild" -1 — not flagged as near-defeat for the defender.
- A 1-step escape (raw=1) becomes -1 after multiplication, fires the sentinel, and returns the **invader's** pre-victory value — completely inverting the evaluation.

**Fix:** return the raw `getStepForEscape` result as an `MGPOptional<number>` and check `isAbsent()` before multiplying by the score modifier, or use a sentinel that cannot collide (e.g., 0).

---

## No Other Issues Found

- `getBoardValue`: multi-metric `[stepForEscape, safeScore, threatenedScore, controlScore]` — escape distance is the primary criterion. ✓
- `_getStepForEscape`: BFS through king's reachable empty cells; returns `step` when any next-gen cell is a corner. `handledCoords` prevents revisiting. ✓
- `getNextGen`: extends from each previous-gen coord in 4 directions through empty cells; skips already-handled coords. ✓
