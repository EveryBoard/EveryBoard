# Review: `games/martian-chess/MartianChessTutorial.ts`

## Summary

Tutorial for Martian Chess. Two description bugs in tutorial steps.

---

## Findings

### 1. "Field Promotion (2/2)" says "You're playing Light" but it's Dark's turn

**Severity:** Medium (wrong instruction to player)

```typescript
// turn=0 → Player ZERO (Dark) plays
new MartianChessState([...], 0),
```

The state has `turn=0` (Dark's turn). The pieces being merged (`(1,7)` and `(2,6)`) are in rows 6–7 (Dark's territory). The tutorial says "Such a move is possible for Light. Do it." — but the current player is Dark, not Light. Should read "You're playing Dark."

### 2. "End by emptyness" says "Light player can win this way" but Dark wins

**Severity:** Medium (wrong instruction/outcome)

```typescript
// turn=0 → Dark plays; pawn at (2,4) in Dark's territory (rows 4-7)
new MartianChessState([...], 0),
```

The step has `turn=0` (Dark's turn). The only piece in Dark's territory is the pawn at `(2,4)`. Moving it to row 3 (Light's territory) empties Dark's territory, triggering game-end where the **previous player (Dark)** wins the tiebreak. The description says "Light player can win this way" — but it is Dark who empties their territory and wins. Should read "Dark player can win this way."

---

## No Other Issues Found

- "Moving queens" step (turn=1, Light): queen at (2,3) moving to (2,7) captures a pawn and lands in Dark's territory. Predicate checks `result.getPieceAt(end) === QUEEN` — still passes. ✓
- "Captures" step: queen at (0,2) diagonal move to (2,4) over empty (1,3) captures pawn. ✓
- "Field Promotion (1/2)" step: PAWN+PAWN=DRONE at (1,1)↔(2,2) in Light's territory (rows 0-3), no drone present — legal. ✓
- "Restarting the clock" step (countDown=1): queen at (1,7) moves to (1,1) — 6 steps straight up through empty squares — captures pawn, restarting countdown. ✓
- "End game (by clock)" step uses `anyMove` — turn=15 with countDown=1; any valid move ends the game. ✓
- "Call the clock" predicate checks `move.calledTheClock` — correct. ✓
