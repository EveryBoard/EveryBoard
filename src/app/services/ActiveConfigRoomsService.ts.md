# Review: `services/ActiveConfigRoomsService.ts`

## Summary
Small service for lobby room tracking. Two design gaps: no `subscribeToLobby` call inside `subscribe`, and no `Error` callback registration.

---

## Findings

### 1. `subscribe` does not call `subscribeToLobby` — caller must do it separately

**Severity:** Medium

`ConfigRoomService.join` internally calls `subscribeToConfigRoom` as part of setup. By contrast, `ActiveConfigRoomsService.subscribe` only registers message callbacks without issuing a `subscribeToLobby` request to the backend. The caller must call `backendService.subscribeToLobby()` separately; if they forget, no `ConfigRoomUpdate` or `ConfigRoomDeleted` events will arrive, and the service appears to work but never fires callbacks.

**Recommendation:** Call `backendService.subscribeToLobby()` inside `subscribe`, and include its `Subscription` in the returned teardown — matching the pattern in `ConfigRoomService`.

---

### 2. No `Error` callback — backend errors silently dropped

**Severity:** Low

`ConfigRoomService.join` registers an `Error` callback to surface backend errors. `ActiveConfigRoomsService.subscribe` registers no `Error` callback; any backend error for the lobby subscription is silently consumed (logged as a warning by `receive`).

---

### 3. `ConfigRoomUpdate` callback tag conflicts with `ConfigRoomService`

**Severity:** Informational

Both `ActiveConfigRoomsService` and `ConfigRoomService` register a callback under the same `'ConfigRoomUpdate'` tag. `setCallback` throws if the tag already has a callback. If both services are active simultaneously (unlikely by design, but not enforced), the second `subscribe`/`join` call will throw. The design relies on an implicit exclusive-use contract between the lobby and game-room contexts.

---

### 4. `activeRooms` map passed by reference to every callback

**Severity:** Informational

```typescript
const activeRooms: MGPMap<string, ConfigRoom> = new MGPMap();
// ...
callback(activeRooms);
```

The same `MGPMap` instance is passed to every callback invocation. Callers that retain a reference to the map will see subsequent mutations. This is intentional for reactive updates but violates a snapshot-per-event contract if callers expect stable references.

---

## No Other Issues Found

- Composite teardown unsubscribes both callbacks correctly.
