# Review: `services/ConnectedUserService.ts`

## Summary
Several correctness issues: `toMinimalUser()` can throw for Google users without usernames, a double sign-in in `registerAfterUsernameCheck` risks assertion failure, and TOCTOU races in both `doRegister` and `setUsername`. One localization inconsistency.

---

## Findings

### 1. `AuthUser.toMinimalUser()` calls `.get()` on absent `username` — throws for Google accounts

**Severity:** High

```typescript
public toMinimalUser(): MinimalUser {
    return {
        id: this.id,
        name: this.username.get(),   // throws if username is absent
    };
}
```

Google OAuth accounts are created with no username (`username` is `undefined` from Firestore until the user sets one). Calling `toMinimalUser()` on such an `AuthUser` throws. Any code path that calls `toMinimalUser()` for a recently-registered Google user will crash.

**Recommendation:** Guard with `this.username.getOrElse('')` or assert presence before calling `toMinimalUser()`.

---

### 2. `registerAfterUsernameCheck` signs in twice — risks double `onAuthStateChanged` firing

**Severity:** Medium

```typescript
const userCredential = await Auth.createUserWithEmailAndPassword(this.auth, email, password);
// Directly logs in
await Auth.signInWithEmailAndPassword(this.auth, email, password);
```

`createUserWithEmailAndPassword` already signs the user in and fires `onAuthStateChanged`. The subsequent `signInWithEmailAndPassword` is a redundant second sign-in. If Firebase fires `onAuthStateChanged` again for the same user, the assertion at line 118 would throw:

```typescript
Utils.assert(this.user.isAbsent(), 'ConnectedUserService received a double update for an user, this is unexpected');
```

At that point, `this.user` is already `Present` from the first auth state change, so the assertion fails. In practice Firebase may suppress the second notification for the same user, but the design relies on undocumented SDK behavior.

**Recommendation:** Remove the redundant `signInWithEmailAndPassword` call — `createUserWithEmailAndPassword` handles sign-in.

---

### 3. TOCTOU race in `doRegister` — two users can register same username

**Severity:** Medium

```typescript
if (await this.userService.usernameIsAvailable(username)) {
    return this.registerAfterUsernameCheck(username, email, password);
}
```

The availability check and the user creation are separate async operations. Between the check returning `true` and the new user's document being written to Firestore, a concurrent registration can claim the same username. The second caller also sees the username as available and succeeds.

**Recommendation:** Use a Firestore transaction or a uniqueness index at the database level to guarantee atomicity.

---

### 4. TOCTOU race in `setUsername` — same issue

**Severity:** Medium

```typescript
const available: boolean = await this.userService.usernameIsAvailable(username);
if (available === false) {
    return MGPValidation.failure(...);
}
// ... then calls userService.setUsername
```

Same check-then-act pattern as `doRegister`. Concurrent calls can bypass the uniqueness check.

---

### 5. `user` field is `public` and mutable

**Severity:** Low

```typescript
public user: MGPOptional<AuthUser> = MGPOptional.empty();
```

External code can write to this field, breaking the invariant that `user` reflects the actual Firebase auth state. Should be `private` with a `getUser()` getter.

---

### 6. `disconnect()` error message is not internationalized

**Severity:** Low

```typescript
return MGPValidation.failure('Cannot disconnect a non-connected user');
```

Every other error message in the file uses `$localize` for i18n (e.g., `$localize\`This email address is already in use.\``). This string is a bare English literal and will not be translated.

---

### 7. `authSubscription` wrapping pattern is non-obvious

**Severity:** Informational

```typescript
this.authSubscription = new Subscription(FireAuth.onAuthStateChanged(this.auth, async(user) => { ... }));
```

`FireAuth.onAuthStateChanged` returns a Firebase `Unsubscribe` function. `new Subscription(fn)` is an RxJS idiom where `fn` becomes the teardown logic — so calling `authSubscription.unsubscribe()` invokes the Firebase unsubscribe. This is valid but non-obvious; a comment explaining the idiom would help.

---

## No Other Issues Found

- `catchFirebaseError` correctly re-throws non-Firebase errors and wraps Firebase errors as `MGPFallible.failure`.
- `mapFirebaseError` correctly merges `user-not-found` and `wrong-password` into a generic credential error for security.
- `replaySubject(1)` ensures late subscribers get the most recent auth state.
- `ngOnDestroy` correctly unsubscribes both `userSubscription` and `authSubscription`.
