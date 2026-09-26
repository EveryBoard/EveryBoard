# Review: `components/wrapper-components/online-game-wrapper/OGWCRequestManagerService.ts`

## Summary
Clean request-state manager. One issue: `onReceivedReply` calls `toMinimalUser()` which can throw for Google users without usernames (same issue as in the online game wrapper).

---

## Findings

### 1. `onReceivedReply` calls `toMinimalUser()` — throws for Google users without usernames

**Severity:** High (same root cause as `ConnectedUserService.ts.md`)

```typescript
const user: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
```

`toMinimalUser()` calls `this.username.get()` which throws if username is absent. For Google accounts before they set a username, receiving any reply event crashes this method.

---

## No Other Issues Found

- `forbiddenRequests` correctly uses an immutable `Set.addElement` pattern (returns a new set).
- `canMakeRequest` correctly blocks when any request is already awaiting a reply.
- `getUnrespondedRequestFrom` correctly uses user ID comparison (not name).
- `requestInfos` as a static `Record<RequestType, RequestInfo>` correctly provides UI metadata for all three request types.
