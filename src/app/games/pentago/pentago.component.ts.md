# Review: `games/pentago/pentago.component.ts`

## Summary

Component for Pentago. One cosmetic display issue found.

---

## Findings

### `canSkipRotation` may display after a winning drop

**Severity:** Low (display only)

```typescript
const gameStatus: GameStatus = this.rules.getGameStatus(this.node);
this.canSkipRotation = postDropState.neutralBlocks.length > 0 && gameStatus.isEndGame === false;
```

`this.node` reflects the pre-drop state, so `gameStatus.isEndGame` can return `false` even when the drop itself creates a winning alignment. In that case, the "skip rotation" button is shown briefly before the user acts. Clicking it correctly ends the game, so this is cosmetic only.

---

## No Other Issues Found

- `showLastDrop` correctly looks up `ROTATION_MAP` to find the post-rotation local coord, then translates to global coords using the block center offset. ✓
- Center-dropped pieces (localCoord == (0,0)) are not rotated and use `move.coord` directly. ✓
- Drops in a different block than the rotated block also use `move.coord` directly via `coordBelongToBlock`. ✓
- `getBlockClasses(x, y)`: `blockIndex = x + 2*y` maps the 2×2 block grid correctly. ✓
- All-neutral-after-drop case (`neutralBlocks.length === 4`) is handled by immediate submission. ✓
