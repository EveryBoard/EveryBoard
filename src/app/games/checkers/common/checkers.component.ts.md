# Review: `games/checkers/common/checkers.component.ts`

## Summary
Abstract checkers component with complex click handling for multi-step captures. Two issues found.

---

## Findings

### 1. `capture` calls `currentMove.get()` without checking success

**Severity:** Medium

```typescript
const currentMove: MGPFallible<CheckersMove> = CheckersMove.fromCapture(this.currentMoveClicks);
if (this.legalMoves.some((capture: CheckersMove) => capture.isPrefix(currentMove.get()))) {
```

`CheckersMove.fromCapture` returns a `MGPFallible`. If the constructed capture is invalid (e.g., duplicate coordinate path), `.get()` would throw. While `getCaptureValidity` is called before this, it validates the sub-move direction but not uniqueness. In practice this should be safe, but `.get()` without `.isSuccess()` check is fragile.

---

### 2. `getScoreName` accesses `this.config` which may be uninitialized at call time

**Severity:** Informational

```typescript
protected override getScoreName(): ScoreName {
    if (this.config.canStackPieces) {
```

`this.config` is a property likely initialized in `setRulesAndNode`. If `getScoreName` is called before `setRulesAndNode` completes, `this.config` would be undefined. The order of initialization depends on the parent class lifecycle.

---

## No Other Issues Found

- Multi-step capture click handling correctly maintains `constructedState` as a running partial capture state.
- `showPossibleClicks` correctly filters valid next clicks by prefix matching legal moves.
- `adaptXY` correctly flips the board for Player.ONE's perspective.
- `getParallelogramCenterOf` correctly uses bounding box for center computation.
