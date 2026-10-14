# Review: `games/apagos/apagos.component.ts`

## Summary
Apagos game component. Two issues found.

---

## Findings

### 1. `lastMoveSquares` field is uninitialized

**Severity:** Medium

```typescript
public lastMoveSquares: number[];
```

`lastMoveSquares` is declared without initialization. It's first populated in `showLastDrop`. `getSquareClasses` calls `this.lastMoveSquares.includes(x)` — if `hideLastMove` was never called before the first render, `lastMoveSquares` is `undefined`, causing `undefined.includes(...)` to throw. Should be initialized to `[]`.

---

### 2. `onArrowClick` calls `ApagosMove.transfer(...).get()` which may throw

**Severity:** Medium

```typescript
const move: ApagosMove = ApagosMove.transfer(square, x).get();
```

`ApagosMove.transfer` returns `MGPFallible<ApagosMove>`. If somehow `square <= x` (a transfer from lower to higher), the fallible contains a failure and `.get()` throws. While `showAndGetPossibleTranfers` only shows arrows for `landingX < selectedPiece.square`, race conditions or stale state could produce inconsistent results. Should check `.isSuccess()` before calling `.get()`.

---

## No Other Issues Found

- `getSquareClasses` correctly combines selected, last-move, and base styles.
- `showPossibleDrops` correctly shows drop arrows for both colors when remaining pieces exist.
- `getPieceClasses` correctly handles the left-piece highlighting for transfers.
