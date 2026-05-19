# Review: `guard/account-guard.ts`

## Summary
Functional abstract guard pattern using `ReplaySubject` to get the current auth user once. Two minor concerns: shared `userSubscription` field risks overwrite on concurrent activation, and multiple auth events fire the callback redundantly.

---

## Findings

### 1. `userSubscription` is a shared field — concurrent `canActivate` calls overwrite each other

**Severity:** Low

```typescript
protected userSubscription!: Subscription;

public async canActivate(): Promise<boolean | UrlTree> {
    const result = await new Promise((resolve) => {
        this.userSubscription = this.connectedUserService.subscribeToUser(...);
    });
    this.userSubscription.unsubscribe();
}
```

If `canActivate` is invoked concurrently on the same guard instance (rare in Angular routing but possible with nested guards), the second call overwrites `this.userSubscription`. The first call's `unsubscribe()` then unsubscribes the second call's subscription, leaking the first.

**Recommendation:** Use a local variable instead of the instance field:
```typescript
let subscription: Subscription;
subscription = this.connectedUserService.subscribeToUser(async(user) => {
    resolve(await this.evaluateUserPermission(user));
});
```

---

### 2. Auth events after the first one fire `evaluateUserPermission` redundantly

**Severity:** Low

`connectedUserService.subscribeToUser` subscribes to a `ReplaySubject`. If the auth state changes while `evaluateUserPermission` is still awaiting, the callback fires again. Since the promise is already resolved, the second `resolve()` call is a no-op — but `evaluateUserPermission` runs unnecessarily (and potentially triggers side effects). The subscription is unsubscribed only after the promise resolves, so this is a timing window.

---

## No Other Issues Found

- The overall pattern (subscribe to ReplaySubject, take first value, unsubscribe) is correct.
- `evaluateUserPermission` being async means the subscription is correctly assigned before unsubscribe is called.
