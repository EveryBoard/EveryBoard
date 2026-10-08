# Review: `games/kamisado/kamisado.component.ts`

## Summary

Kamisado component with automatic piece selection (forced-color mechanic). One cosmetic finding.

---

## Findings

### 1. `lastMove` declared but never assigned

**Severity:** Cosmetic

```typescript
public lastMove: MGPOptional<KamisadoMove> = MGPOptional.empty();
```

`lastMove` is initialized but never set anywhere (neither in `showLastMove` nor `updateBoard`). Only `lastPieceMove` is updated. If the template references `lastMove`, it will always be empty. Dead field.

---

## No Other Issues Found

- `choosePiece` does not validate color or emptiness — incorrect selections are caught by `isLegal` at move submission.
- `cancelMoveAttempt` correctly preserves `chosen` when `chosenAutomatically = true` (forced piece cannot be deselected).
- `updateBoard` correctly shows automatic selection only when there is a forced piece, the game is ongoing, and the player is not forced to pass.
- `onClick` correctly returns MUST_PASS when the player has no legal moves, directing them to the pass button.
- Clicking a different own piece when `chosenAutomatically = false` correctly re-selects that piece as the new start.
