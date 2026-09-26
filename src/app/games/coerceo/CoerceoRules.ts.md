# Review: `games/coerceo/CoerceoRules.ts`

## Summary
Core rules implementation for Coerceo. One issue found.

---

## Findings

### 1. `isLegalMovement` does not reject landings on opponent pieces

**Severity:** Medium

```typescript
const lander: FourStatePiece = state.getPieceAt(move.getEnd());
if (lander.is(state.getCurrentPlayer())) {
    return MGPValidation.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
}
return MGPValidation.SUCCESS;
```

The check only blocks landing on the current player's own pieces. Landing on an opponent's piece is not rejected — the move is considered legal. If such a move were applied, `applyLegalMovement` would overwrite the opponent piece, silently removing it without recording a capture. The move generator (`getLegalLandings`) likely prevents this from occurring in AI play, but a UI-submitted move landing on an opponent piece would pass validation. The condition should also check `lander.is(state.getCurrentOpponent())`.

---

## No Other Issues Found

- `applyLegalTileExchange` correctly decrements tile count by 2 and records the capture.
- `getGameStatus` correctly checks for absence of each player's piece type in `toPieceMap`.
- `isLegalTileExchange` correctly validates tile count and rejects self-capture.
