# Review: `components/wrapper-components/GameWrapper.ts`

## Summary
Central game wrapper coordinating the game component and player interactions. One real bug: the `boardRef` assertion checks the signal object rather than the signal's value. One type mismatch with `cancelMoveOnWrapper`.

---

## Findings

### 1. `boardRef` assertion checks the signal itself, not its value — assertion always passes

**Severity:** Medium

```typescript
Utils.assert(this.boardRef != null, 'Board element should be present');
const componentRef = Utils.getNonNullable(this.boardRef()).createComponent(component);
```

`this.boardRef` is a `Signal<ViewContainerRef | undefined>` — a signal object, which is never `null`. The assertion `this.boardRef != null` is always `true`. The actual `undefined` case is when `this.boardRef()` (calling the signal) returns `undefined` (before the view is initialized). `Utils.getNonNullable(this.boardRef())` then throws with a generic error if `boardRef()` is undefined, without the helpful assertion message.

**Recommendation:** Fix the assertion:
```typescript
Utils.assert(this.boardRef() != null, 'Board element should be present');
const componentRef = this.boardRef()!.createComponent(component);
```

---

### 2. `cancelMoveOnWrapper` type mismatch — Promise silently dropped

**Severity:** Low

In `GameComponent`:
```typescript
public cancelMoveOnWrapper: (reason?: string) => void;
```

In `GameWrapper.createGameComponent`:
```typescript
this.gameComponent.cancelMoveOnWrapper = (reason?: string): Promise<void> => {
    return this.onCancelMove(reason);
};
```

The field is typed `=> void` but assigned a `=> Promise<void>`. TypeScript allows this (returning a Promise where `void` is expected), but the caller `GameComponent.cancelMove` does not await it:
```typescript
this.cancelMoveOnWrapper(reason);  // Promise is dropped
```
If `onCancelMove` does async work that must complete before proceeding, it will be missed.

---

### 3. `isPlayerTurn` returns `true` when no player is registered

**Severity:** Informational

```typescript
} else {
    return true;  // players[indexPlayer] is absent
}
```

When the player list is unset, any player can interact. This is correct for local play initialization but may be surprising if `players` is partially populated (e.g., only one player set).

---

## No Other Issues Found

- `receiveValidMove` re-validating legality is a correct defensive check.
- `showCurrentState` correctly guards `showNewMove` with `if (this.gameComponent.node.previousMove.isPresent())`.
- `canUserPlay` correctly tracks `isMoveAttemptOngoing` to distinguish first click from subsequent clicks.
