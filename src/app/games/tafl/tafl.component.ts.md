# Review: `games/tafl/tafl.component.ts`

## Summary

Abstract base component for Tafl variants. One cosmetic bug: `isInvader` is hardcoded to Player.ZERO's pawn.

---

## Findings

### 1. `isInvader` hardcodes Player.ZERO — wrong when invader = Player.ONE

**Severity:** Low (cosmetic / visual only)

```typescript
public isInvader(x: number, y: number): boolean {
    return this.board[y][x] === TaflPawn.PLAYER_ZERO_PAWN;
}
```

Used in the template to render invader-specific visuals. When `invaderStarts = false` → `getInvader(config) = Player.ONE`, but `isInvader` still checks for `PLAYER_ZERO_PAWN`. Player.ONE's pawns would not be styled as invaders. The correct check should use `this.rules.getInvader(this.getConfig())` to decide which player's pawns are invaders.

---

## No Other Issues Found

- `showLastMove`: `opponent = getCurrentOpponent()` after the move = the player who just moved. `getRelativeOwner(opponent, captured) === OPPONENT` correctly identifies captures (the non-mover's piece that became empty). ✓
- `onClick` / `choosePiece` / `chooseDestination`: standard two-click pattern; `generateMove` is fallible; cancel on failure. ✓
- `updateViewInfo`: builds `pieceClasses[y][x]` matrix; empty squares get `['']`, occupied get classes from `getPieceClasses`. ✓
- `getClickables`: returns destinations when piece selected; returns player pieces otherwise. ✓
- `cancelMoveAttempt`: clears `chosen` and refreshes view. ✓
