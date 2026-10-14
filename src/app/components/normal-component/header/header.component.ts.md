# Review: `components/normal-component/header/header.component.ts`

## Summary
Header component with user/game state display. Two issues found.

---

## Findings

### 1. `navigateToPart` and `getCurrentGameName` call `.get()` on potentially empty `currentGame`

**Severity:** Medium

```typescript
public async navigateToPart(): Promise<boolean> {
    return this.router.navigate(['/play', this.currentGame.get().gameName, this.currentGame.get().id]);
}

public getCurrentGameName(): string {
    return GameInfo.getByUrlName(this.currentGame.get().gameName).get().name;
}
```

Both methods call `this.currentGame.get()` without a guard. If `currentGame` is empty (user has no current game), this throws. These are presumably only called when `currentGame.isPresent()` is true (via template guards), but the methods themselves have no defensive check and could throw if called in an unexpected context.

Additionally, `getCurrentGameName` chains `.get()` on `GameInfo.getByUrlName(...)` — if the game name is unrecognized, this also throws.

---

### 2. `ngOnInit` doesn't initialize subscriptions before component is visible

**Severity:** Informational

`userSubscription` and `currentGameSubscription` are initialized as `new Subscription()` (which is a no-op subscription). If Angular's `ngOnInit` is called late or the component is destroyed before `ngOnInit`, the subscriptions are harmlessly cleaned up. This is a common pattern and is fine.

---

## No Other Issues Found

- Both subscriptions are correctly unsubscribed in `ngOnDestroy`.
- Fallback from `username` to `email` in the user subscription is correct.
