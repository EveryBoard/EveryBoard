# Review: `games/quebec-castles/QuebecCastlesRules.ts`

## Summary

Rules for Quebec Castles. One medium finding: config validators check the wrong player/count. One cosmetic note on inverted comments.

---

## Findings

### 1. Config validators check wrong player against wrong piece count

**Severity:** Medium

```typescript
private static enoughPlaceForInvaders(config: QuebecCastlesConfig): MGPValidation {
    return QuebecCastlesRules.isThereEnoughPlaceForPiece(Player.ZERO, config, config.invaders);
    // Player.ZERO = Defender (1-step), but checks against config.invaders count
}
private static enoughPlaceForDefenders(config: QuebecCastlesConfig): MGPValidation {
    return QuebecCastlesRules.isThereEnoughPlaceForPiece(Player.ONE, config, config.defenders);
    // Player.ONE = Invader (2-step), but checks against config.defenders count
}
```

Player.ZERO is the Defender (moves 1 step per `getPlayerStepSize` and `INVALID_DEFENDER_DISTANCE` in `getMiddleValidity`), owning `config.defenders` pieces. Player.ONE is the Invader with `config.invaders` pieces. But the validators cross the counts:
- `enoughPlaceForInvaders` checks Defender's territory (ZERO) against `config.invaders` count.
- `enoughPlaceForDefenders` checks Invader's territory (ONE) against `config.defenders` count.

Both should be swapped: `enoughPlaceForInvaders` → `(Player.ONE, config, config.invaders)`, `enoughPlaceForDefenders` → `(Player.ZERO, config, config.defenders)`.

---

## Notes

### Inverted "Invader/Defender" comments in `getGameStatus`

```typescript
return GameStatus.ZERO_WON; // Player.ZERO (Invader) stepped on Player.ONE (Defender)'s castle, victory
```

Player.ZERO is the Defender (1-step mover), not the Invader. The game logic is correct (when ZERO occupies ONE's castle, ZERO wins), but the comment labels are reversed. The actual relationship: Player.ZERO = Defender (territory at bottom, 1 step), Player.ONE = Invader (territory at top, 2 steps).

---

## No Other Issues Found

- `getLegalRangeFromMaximum`: ZERO territory = bottom (`min=(max+1)-linesForTerritory`), ONE territory = top (`max=linesForTerritory-1`). ✓
- `getLandingValidity`: `castles.get(player).get()` is safe because translation only occurs after drop phase when castles are placed. ✓
- `getPossibleMovesFor`: invader (step=2) checks intermediate cell is empty before computing landing; `getLandingValidity` handles out-of-range landing. ✓
- `getGameStatus`: all four win conditions (ZERO on ONE's castle, ONE on ZERO's castle, ZERO eliminated, ONE eliminated) are consistent with game logic. ✓
- `getLineFirstCoord`: correctly centers pieces symmetrically on a line, skipping center when odd-length line has even-count drop. ✓
