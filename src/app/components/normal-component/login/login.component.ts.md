# Review: `components/normal-component/login/login.component.ts`

## Summary
Login component with email/Google sign-in. One minor display-state issue found.

---

## Findings

### 1. `errorMessage` field is uninitialized and typed as `string` (not `string | undefined`)

**Severity:** Cosmetic

```typescript
public errorMessage: string;
```

The field is declared without initialization and without `| undefined`. This is not a compiler error in this repo because `strictPropertyInitialization` is explicitly disabled in `tsconfig.json`, but the template can still observe `undefined` before the first failed login. Should be `public errorMessage: string = ''` or `string | undefined`.

---

## No Other Issues Found

- User subscription is correctly unsubscribed in `ngOnDestroy`.
- Redirect on already-connected user is correct.
- `canLogin` guard correctly prevents empty submission.
