# Review: `components/normal-component/reset-password/reset-password.component.ts`

## Summary
Password reset component. One access modifier issue found.

---

## Findings

### 1. `connectedUserService` is `public` instead of `private`

**Severity:** Cosmetic

```typescript
public readonly connectedUserService: ConnectedUserService = inject(ConnectedUserService);
```

The service is injected as `public`, which exposes it in the component API unnecessarily. It should be `private` — the template does not need direct access to it, as all interactions go through `resetPassword()`.

---

## No Other Issues Found

- `resetPassword` correctly clears prior state before retrying.
- Assert for empty email is a reasonable defensive check.
