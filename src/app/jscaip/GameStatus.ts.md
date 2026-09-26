# Review: `jscaip/GameStatus.ts`

## Summary
Clean singleton pattern. One minor design note.

---

## Findings

### 1. `toBoardValue` assigns 0 to a draw — may conflict with heuristic scores

**Severity:** Low (design note)

```typescript
public toBoardValue(): BoardValue {
    if (this.winner.isPlayer()) {
        return BoardValue.of(this.winner.getVictoryValue()); // ±Infinity
    } else {
        return BoardValue.of(0); // draw
    }
}
```

A draw returns `BoardValue.of(0)`. Heuristics also return scores around 0 for balanced positions. This means a drawn terminal state and a perfectly balanced non-terminal state both score 0 — the AI cannot distinguish between "this position leads to a guaranteed draw" and "this position is roughly balanced but not yet decided". For minimax this is usually acceptable, but it means the AI won't actively seek a draw as a guaranteed outcome over a risky near-balanced position.

---

## No Other Issues Found

- `ZERO_WON`, `ONE_WON`, `DRAW`, `ONGOING` are correct singletons.
- `getVictory(player)` and `getDefeat(player)` are correctly symmetric.
