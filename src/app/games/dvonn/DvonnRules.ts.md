# Review: `games/dvonn/DvonnRules.ts`

## Summary
Rules for Dvonn. Two issues found.

---

## Findings

### 1. `isLegal` returns `MGPFallible` instead of `MGPValidation` in three places

**Severity:** Medium

```typescript
if (move.getDistance() !== stack.getSize()) {
    return MGPFallible.failure(DvonnFailure.INVALID_MOVE_LENGTH());  // line 198
}
if (targetStack.isEmpty()) {
    return MGPFallible.failure(DvonnFailure.EMPTY_TARGET_STACK());  // line 203
}
return MGPFallible.success(undefined);  // line 205 — should be MGPValidation.SUCCESS
```

The declared return type is `MGPValidation`. Three code paths use `MGPFallible` instead. If `MGPValidation` and `MGPFallible<void>` are structurally compatible, this compiles but is inconsistent with the rest of the method which uses `MGPValidation.failure`. In particular, `MGPFallible.success(undefined)` may produce a different object than `MGPValidation.SUCCESS`.

---

### 2. `getScores` uses `map` for side effects

**Severity:** Cosmetic

```typescript
state.getAllPieces().map((c: Coord) => {
    p0Score += ...;
    p1Score += ...;
});
```

`Array.map` is used purely for accumulation side effects; the returned array is discarded. Should be `forEach`.

---

## No Other Issues Found

- `removeDisconnectedPieces` correctly iterates the pre-computed piece list against the evolving new state.
- `isLegal` correctly allows PASS only when no moves are available AND the previous move was not a pass.
