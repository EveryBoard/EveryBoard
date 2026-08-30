# Review: `jscaip/state/TriangularGameState.ts`

## Summary
Thin wrapper. One inherited crash risk, one identity-equality assumption.

---

## Findings

### 1. Static `getEmptyNeighbors` crashes on empty board

**Severity:** Low (same issue as `GameStateWithTable.getWidth`)

```typescript
board[0].length  // crashes if board = []
```

Directly parallels the issue in `GameStateWithTable.getWidth()`. The static overload takes a raw `Table<U>` with no guard.

---

### 2. Piece comparison uses `===` rather than `comparableEquals`

**Severity:** Low (design assumption)

```typescript
board[neighbor.y][neighbor.x] === empty
```

This identity comparison works only if pieces are singleton objects (e.g., enum-like constants). If a game uses object-valued pieces, two "empty" pieces that are structurally equal but distinct instances would not match. All current `TriangularGameState` subclasses use singleton pieces, so no bug today — but a future subclass with object pieces would silently break.

---

## No Other Issues Found

- `FourStatePieceTriangularGameState.hasPieceBelongingTo` correctly uses `getOptionalPieceAt` and guards with `isPresent()`.
