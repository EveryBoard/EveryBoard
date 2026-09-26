# Review: `services/ConfigRoomService.ts`

## Summary
Clean service mirroring `GameService` patterns. One ordering issue: callbacks are registered after subscription begins.

---

## Findings

### 1. Callbacks registered after `subscribeToConfigRoom` — subscription messages can be missed

**Severity:** Medium

```typescript
const gameSubscription: Subscription = await this.backendService.subscribeToConfigRoom(gameId);
// ... other callbacks ...
const errorSubscription: Subscription =
    this.backendService.setCallback('Error', (message: BackendMessage): void => {
        error(message.getArgument('reason'));
});
```

`subscribeToConfigRoom` is awaited before the `Error`, `ConfigRoomUpdate`, `ConfigRoomDeleted`, `CandidateJoined`, and `CandidateLeft` callbacks are registered. Any reply or initial update sent during the subscription handshake can arrive before the callback is wired and be silently dropped (logged as a warning in `receive`).

**Recommendation:** Register all callbacks before calling `subscribeToConfigRoom`, then include the subscription teardown in the returned composite subscription.

---

## No Other Issues Found

- Composite teardown correctly unsubscribes all 6 subscriptions.
- `proposeConfig`, `selectOpponent`, `reviewConfig`, and `acceptConfig` are straightforward WebSocket sends.
