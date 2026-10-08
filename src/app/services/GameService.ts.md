# Review: `services/GameService.ts`

## Summary
Clean service abstraction over WebSocket game actions. One ordering issue in `subscribeTo` where the error callback is set up after the subscription begins, and one pattern concern with silently discarded async errors.

---

## Findings

### 1. Error callback registered after `subscribeToGame` — errors during subscription handshake may be dropped

**Severity:** Medium

```typescript
const gameSubscription: Subscription = await this.backendService.subscribeToGame(gameId);
const errorSubscription: Subscription =
    this.backendService.setCallback('Error', (message: BackendMessage): void => { ... });
```

`subscribeToGame` is awaited before the `Error` callback is registered. If the backend sends an `Error` message in response to the subscription request (e.g., game not found), it arrives and is processed by the backend message router before line 137. The error would be silently dropped because no callback is registered at that point.

**Recommendation:** Register the error callback before calling `subscribeToGame`.

---

### 2. `gameUpdate` / `gameEvent` promise errors silently discarded

**Severity:** Low

```typescript
this.backendService.setCallback('GameUpdate', (message: BackendMessage): void => {
    void gameUpdate(message.getArgument('game'));
});
```

`void` intentionally suppresses the floating-promise lint warning, but any rejection from `gameUpdate` or `gameEvent` is silently lost. If these callbacks throw (e.g., due to a decoding error or component state mismatch), there is no error surfacing.

The `error` callback on the same subscription is only invoked for backend-sent errors, not for errors thrown during client-side processing of a valid message.

**Recommendation:** Wrap in a `.catch()` that forwards to the `error` callback or logs via `Utils.logError`.

---

## No Other Issues Found

- The composite subscription teardown pattern (wrapping all 4 subscriptions in one `new Subscription(() => {...})`) is correct and complete.
- `propose/accept/reject` delegating to `gameAction` with a typed union `'TakeBack' | 'Draw' | 'Rematch'` is clean.
- `createGame` correctly maps the backend reply to the game ID string.
- `AbstractGameService.gameAction` returning `Promise<void>` propagates rejections to callers that await it.
