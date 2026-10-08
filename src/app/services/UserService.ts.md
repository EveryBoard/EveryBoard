# Review: `services/UserService.ts`

## Summary
Minimal service, no logic issues. One design note.

---

## Findings

### 1. `usernameIsAvailable` fetches all matching documents — inefficient

**Severity:** Informational

```typescript
const usersWithSameUsername: FirestoreDocument<User>[] = await this.userDAO.findWhere([['username', '==', username]]);
return usersWithSameUsername.length === 0;
```

This returns all matching documents; only the count matters. A Firestore `limit(1)` query would be more efficient, especially on a collection that could be large. The current approach downloads full documents unnecessarily.

---

## No Other Issues Found

- `setUsername` and `markAsVerified` are straightforward Firestore updates.
- No TOCTOU logic here; the race conditions noted in `ConnectedUserService.ts.md` are in the calling code, not here.
