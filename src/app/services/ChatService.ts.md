# Review: `services/ChatService.ts`

## Summary
Minimal service, clean. One note about no backend subscription request.

---

## Findings

### 1. `subscribeToMessages` registers a callback but sends no subscription request

**Severity:** Informational

Like `ActiveConfigRoomsService`, this service registers a `ChatMessage` callback without sending a subscription request to the backend. Chat messages are presumably delivered as part of an existing game or config-room subscription. This is fine if the backend pushes `ChatMessage` events automatically once a game subscription is active, but if a separate `SubscribeChat` request is needed, the caller must issue it externally.

---

## No Other Issues Found

- `sendMessage` correctly wraps the message in the expected `['ChatSend', { message }]` protocol.
