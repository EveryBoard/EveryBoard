# Review: `games/diaballik/DiaballikRules.ts`

## Summary
Rules for Diaballik including the anti-game defeat condition. Two issues found.

---

## Findings

### 1. `getBallCoordInRow` loops `x < getHeight()` instead of `x < getWidth()`

**Severity:** Medium

```typescript
for (let x: number = 0; x < state.getHeight(); x++) {
```

The loop variable is `x` (column index) but the bound is `getHeight()` (number of rows). The board is 7×7 so this produces correct results currently, but if the board were ever non-square, this would incorrectly miss columns or scan out-of-bounds. Should be `state.getWidth()`.

---

### 2. `isLegalPass` asserts ball ownership instead of returning a validation failure

**Severity:** Medium

```typescript
Utils.assert(startPiece.holdsBall, 'DiaballikRules: cannot pass without the ball');
```

If a player attempts a pass from a piece that doesn't hold the ball, the assertion throws rather than returning `MGPFallible.failure(...)`. All other invalid-move conditions in this file return failures gracefully. This path is reachable from the UI if the user manages to initiate a pass action from the wrong piece. Should be `if (!startPiece.holdsBall) return MGPFallible.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_WITH_BALL())` or similar.

---

## No Other Issues Found

- Ball pass swap logic correctly moves `holdsBall` from start to end.
- Anti-game rule correctly requires a full connected line and ≥3 opponent pieces in contact.
- `getBlockerAndCoords` correctly resolves mutual blocking by giving victory to the mover's opponent.
