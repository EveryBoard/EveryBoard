# Review: `games/mancala/awale/AwaleOrderedMoveGenerator.ts`

## Summary

Ordered move generator for Awalé AI. Two bugs in the move ordering heuristic — does not affect game correctness, only AI move-ordering quality.

---

## Findings

### 1. `playerY` holds the OPPONENT's row index, not the current player's

**Severity:** Medium (AI quality only)

```typescript
const playerY: number = node.gameState.getOpponentY(); // WRONG: getOpponentY() = opponent's row
const opponentY: number = player.getValue();            // = getCurrentPlayer().getValue() = also opponent's row
```

`MancalaState.getOpponentY()` returns `getCurrentPlayer().getValue()` — the **opponent**'s row index (not the current player's). For Player ZERO, `getOpponentY() = 0` (opponent ONE's row) while the player's actual row is 1 (`getCurrentPlayerY() = 1`).

As a result, both `playerY` and `opponentY` hold the opponent's row index (0 for ZERO), and the current player's row index is never computed. The fix:

```typescript
const playerY: number = node.gameState.getCurrentPlayerY(); // player's row
const opponentY: number = node.gameState.getOpponentY();    // opponent's row
```

### 2. Capture scoring conditional is inverted

**Severity:** Medium (AI quality only)

```typescript
if (endHouse.y === playerY) {
    captured = 0;               // "player's side" → no capture (but playerY is opponent's row!)
    ...
} else {
    // "opponent's side" — but this branch fires when endHouse.y is on the PLAYER's side
    captured = AwaleRules.get().captureIfLegal(endHouse.x, opponentY, node.gameState, config).capturedSum;
}
```

Because `playerY` holds the opponent's row index (see bug 1), the condition `endHouse.y === playerY` fires when the last seed lands on the **opponent's** side — which is exactly where Awalé captures occur. So `captured` is set to 0 for moves that could capture, and capture potential is computed for moves ending on the player's own side (which cannot capture). The two branches are effectively inverted.

Additionally, `toDistribute = board[playerY][x]` reads from the opponent's row, not the player's, giving a wrong seed count for the tie-breaking term.

---

## No Other Issues Found

- The overall sorting approach (prioritise captures, then short distributions staying in own territory, then fewer seeds distributed) is a reasonable Awalé move ordering heuristic. The logic is correct in intent; the bugs are in variable assignment. ✓
- `captureIfLegal` is called with `node.gameState` (pre-distribution state) — this is an approximation for ordering, not correctness. ✓
