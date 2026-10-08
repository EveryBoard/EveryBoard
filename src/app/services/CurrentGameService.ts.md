# Review: `services/CurrentGameService.ts`

## Summary
Two real bugs: `getCurrentGame` leaks a subscription when the observable fires synchronously, and `canUserJoin` references `CurrentGameService` (concrete subclass) from inside `AbstractCurrentGameService` (abstract base). One concurrency concern with rapid auth state changes.

---

## Findings

### 1. `getCurrentGame` leaks subscription when `ReplaySubject` fires synchronously

**Severity:** Medium

```typescript
let subscription: Subscription = new Subscription();  // dummy
subscription = this.currentGameObs.subscribe((observed: MGPOptional<CurrentGame>) => {
    resolve(observed);
    subscription.unsubscribe();  // captures closure variable
});
```

`ReplaySubject(1)` fires its buffered value synchronously to each new subscriber. So during the `subscribe()` call (step 2), the callback runs immediately — at which point `subscription` in the closure still refers to the dummy `new Subscription()` from step 1, not the real subscription. The dummy `unsubscribe()` is a no-op. After `subscribe()` returns, the real subscription is assigned to `subscription`, but the callback has already run and will never call `unsubscribe()` again.

Result: every call to `getCurrentGame()` when the observable already has a value creates a permanent subscription that is never cleaned up.

**Recommendation:** Use `take(1)` from RxJS, which unsubscribes automatically after the first emission:
```typescript
return new Promise((resolve) => {
    this.currentGameObs.pipe(take(1)).subscribe(resolve);
});
```

---

### 2. `canUserJoin` references `CurrentGameService` from inside `AbstractCurrentGameService`

**Severity:** Low

```typescript
// In AbstractCurrentGameService.canUserJoin:
const message: string = CurrentGameService.roleToMessage.get(this.currentGame.get().role).get()();
```

`AbstractCurrentGameService` (the abstract base) references `CurrentGameService` (its concrete subclass) by name. This creates a circular dependency — the abstract layer depends on its implementation. It also means any other subclass of `AbstractCurrentGameService` would still use `CurrentGameService.roleToMessage` (the same static, correct here but fragile).

`canUserCreate` (line 70) correctly uses `AbstractCurrentGameService.roleToMessage`. The inconsistency in `canUserJoin` looks like a copy-paste error.

**Recommendation:** Replace `CurrentGameService.roleToMessage` with `AbstractCurrentGameService.roleToMessage` on line 87.

---

### 3. Rapid auth state changes can cause assertion failure during reconnect

**Severity:** Low

`onUserUpdate` is an `async` callback. If auth state changes twice in quick succession (log out then log in before the first callback completes), the second invocation calls `backendSubscription.unsubscribe()` before the first `connect()` has completed. The subscription teardown calls `disconnect()`, which asserts `this.webSocket.isPresent()`. If the WebSocket has not yet opened (`connect()` is still awaiting), this assertion throws.

---

## No Other Issues Found

- `onCurrentGameUpdate`'s three-way comparison (stayed null, stayed same non-null, changed) correctly avoids redundant `ReplaySubject` emissions.
- `roleToMessage` covers all values of the `UserRoleInPart` union; `.get()` on the map will not return empty for valid roles.
- `ngOnDestroy` correctly unsubscribes all three subscriptions.
