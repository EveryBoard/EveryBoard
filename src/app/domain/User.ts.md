# Review: `domain/User.ts`

## Summary
Clean user domain types. One note about `opponent` field optionality.

---

## Findings

### 1. `CurrentGame.opponent` has dual optionality (`?` and `| null`)

**Severity:** Informational

```typescript
opponent?: MinimalUser | null,
```

Using both `?` (field may be absent) and `| null` (field may be null) means three possible absent states: missing key, `undefined`, and `null`. This is typical for Firestore documents (which may or may not include the field), but callers must handle all three cases. A single `opponent: MinimalUser | null` (always present, null when not set) would be cleaner but may not match how Firestore documents are stored.

---

## No Other Issues Found

- `UserRoleInPart` union covers all 5 roles used in `CurrentGameService.roleToMessage`.
- `User.username` is correctly optional (absent for newly created Google accounts).
