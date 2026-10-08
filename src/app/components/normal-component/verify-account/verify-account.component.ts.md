# Review: `components/normal-component/verify-account/verify-account.component.ts`

## Summary
Account verification component handling both email verification and username entry. Three issues found.

---

## Findings

### 1. `user.email.get()` throws for users with no email

**Severity:** Medium

```typescript
this.emailAddress = user.email.get();
```

`user.email` is an `MGPOptional`. Calling `.get()` without a presence check throws if the email is absent (e.g., anonymous users or edge cases in Firebase auth). Should use `user.email.getOrElse('')` or guard with `isPresent()`.

---

### 2. `errorMessage` and `emailAddress` are uninitialized `string` fields

**Severity:** Cosmetic

```typescript
public errorMessage: string;
public emailAddress: string;
```

Both fields are declared without initialization. Reading them before the first `subscribeToUser` callback fires returns `undefined`. Should be initialized to `''` or typed as `string | undefined`.

---

### 3. `ngOnDestroy` has redundant null checks on a typed subscription

**Severity:** Cosmetic

```typescript
if (this.userSubscription != null && this.userSubscription.unsubscribe != null) {
    this.userSubscription.unsubscribe();
}
```

`userSubscription` is typed as `Subscription` (not `Subscription | null | undefined`). The null checks are defensive but reflect uncertainty about the field's lifecycle — the field could be uninitialized if `ngOnInit` fails before assigning. Declaring it as `Subscription | undefined` with a simple `this.userSubscription?.unsubscribe()` would be cleaner.

---

## No Other Issues Found

- The two verification flows (`send-email` vs `enter-username`) are cleanly separated.
- `finalizeEmailVerification` correctly reloads user state before refreshing the page.
