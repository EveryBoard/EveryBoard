# Review: `games/apagos/ApagosHeuristic.ts`

## Summary
Simple heuristic for Apagos. One issue found.

---

## Findings

### 1. `board[3]` hardcodes index 3 — crashes when config `width < 4`

**Severity:** High

```typescript
const levelThreeDominant: PlayerOrNone = node.gameState.board[3].getDominatingPlayer();
```

The board width is configurable (2–7 in `ApagosRules`). If `width < 4`, `board[3]` is `undefined`, causing a crash. The heuristic should use `board[config.width - 1]` (the highest-value square) or gracefully handle smaller boards. This heuristic also ignores the `config` parameter (it doesn't receive one here), which is why the width isn't available — the method signature should include config.

---

## No Other Issues Found

- The idea of prioritizing the highest-indexed square is sound for Apagos.
