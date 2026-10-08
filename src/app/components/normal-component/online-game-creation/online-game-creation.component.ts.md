# Review: `components/normal-component/online-game-creation/online-game-creation.component.ts`

## Summary
Thin routing component that creates an online game and redirects. One issue found.

---

## Findings

### 1. `connectedUserService.user.get()` throws if user is not yet loaded

**Severity:** Medium

```typescript
const authUser: AuthUser = this.connectedUserService.user.get();
Utils.assert(authUser.isConnected(), '...');
```

`this.connectedUserService.user` is an `MGPOptional`. If the auth state hasn't resolved yet (possible if `ngOnInit` fires before the Firebase auth callback), `.get()` throws. The route guard should prevent unauthenticated access, but the comment "User must be connected and have a username" implies this was already verified — the guard state may not guarantee the optional is populated synchronously. Should use `.getOrElse(AuthUser.NOT_CONNECTED)` and handle the failure gracefully, or assert presence before calling `.get()`.

---

## No Other Issues Found

- Game existence check before creation is correct.
- `canUserCreate` guard is properly applied before game creation.
- Navigation to `/notFound` with `skipLocationChange` is correct.
