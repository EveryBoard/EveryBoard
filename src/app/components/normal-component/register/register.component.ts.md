# Review: `components/normal-component/register/register.component.ts`

## Summary
Registration component for email and Google sign-up. One minor display-state issue found. The previously reported Google redirect issue is not confirmed.

---

## Findings

### 1. `errorMessage` is uninitialized and typed as `string` (not `string | undefined`)

**Severity:** Cosmetic

```typescript
public errorMessage: string;
```

Same issue as `LoginComponent`: this is not a compiler error in this repo because `strictPropertyInitialization` is disabled, but the template can still observe `undefined` before the first failed registration. Should be `string = ''` or `string | undefined`.

---

### 2. `registerWithGoogle` navigates to `/verify-account` even for already-verified Google accounts

**Status:** Not confirmed / false positive

```typescript
public async registerWithGoogle(): Promise<void> {
    const result: MGPValidation = await this.connectedUserService.doGoogleLogin();
    if (result.isSuccess()) {
        await this.router.navigate(['/verify-account']);
}
```

New Google OAuth users still need the `/verify-account` flow because this app uses it to collect a username when `AuthUser.username` is absent. Existing verified Google users are protected by `ConnectedButNotVerifiedGuard`, which redirects verified users away from `/verify-account` to `/`. So the unconditional navigation is not itself a correctness bug.

---

## No Other Issues Found

- `canRegister` correctly validates minimum password length before submission.
- `getPasswordHelpClass` correctly provides visual feedback for password strength.
