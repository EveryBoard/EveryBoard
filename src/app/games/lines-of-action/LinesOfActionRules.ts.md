# Review: `games/lines-of-action/LinesOfActionRules.ts`

## Summary

Rules for Lines of Action. One medium finding: simultaneous connection (draw) not recognized as game-over.

---

## Findings

### 1. `getGameStatus` returns ONGOING instead of DRAW when both players form a single group simultaneously

**Severity:** Medium

```typescript
public override getGameStatus(node: LinesOfActionNode): GameStatus {
    const groups: PlayerNumberMap = LinesOfActionRules.getNumberOfGroups(state);
    if (zero === 1 && one > 1) {
        return GameStatus.ZERO_WON;
    } else if (zero > 1 && one === 1) {
        return GameStatus.ONE_WON;
    } else {
        return GameStatus.ONGOING;   // includes the case zero === 1 && one === 1
    }
}
```

`getVictory` (used elsewhere) correctly recognizes `groupsZero === 1 && groupsOne === 1` as a draw (`MGPOptional.of(PlayerOrNone.NONE)`). But `getGameStatus` treats this case as `ONGOING`, so the game never ends when both players connect all their pieces on the same move (ZERO's move could connect all ZERO's pieces while ONE was already fully connected).

Fix: add `else if (zero === 1 && one === 1) { return GameStatus.DRAW; }`.

---

## No Other Issues Found

- `markGroupStartingAt` BFS correctly skips opponent pieces and marks empty cells as group 0 (preventing re-processing).
- `getEntranceAndForwardDirection` diagonal formulas are correct: for UP_RIGHT/DOWN_LEFT, the entrance is `(max(0, x+y-7), min(7, x+y))`; for UP_LEFT/DOWN_RIGHT, the entrance is `(x - min(x,y), y - min(x,y))`.
- `numberOfPiecesOnLine` counts all pieces (both players) on the full line, as per Lines of Action rules.
- `isLegal` correctly allows capturing opponent pieces but not own pieces.
- `possibleTargets` correctly offers exactly one target per direction (exactly N steps where N = piece count on that line).
