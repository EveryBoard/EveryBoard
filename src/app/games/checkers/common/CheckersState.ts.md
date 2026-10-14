# Review: `games/checkers/common/CheckersState.ts`

## Summary
Checkers state with stack-based piece system. No bugs found.

---

## Findings

### 1. `getScores` calls `getStacksOf` twice — double board iteration

**Severity:** Informational

```typescript
const zeroScore: number = this.getStacksOf(Player.ZERO).length;
const oneScore: number = this.getStacksOf(Player.ONE).length;
```

`getStacksOf` iterates the full board. Two calls iterate the board twice. A single pass counting both players would be more efficient, though for the game's board sizes this is negligible.

---

## No Other Issues Found

- `CheckersPiece` singletons correctly use reference equality for `equals`.
- `CheckersStack` is correctly immutable — all mutations return new instances.
- `promoteCommander` correctly handles already-promoted pieces.
- `coordIsCommandedBy` and `isEmptyAt` correctly handle out-of-bounds via `getOptionalPieceAt`.
