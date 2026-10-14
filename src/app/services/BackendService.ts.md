# Review: `services/BackendService.ts`

## Summary
Solid WebSocket service with reconnection. Two bugs: `send()` can throw when called during reconnection (resolved promise + empty socket), and the comment on the `typeof` assertion is misleading/wrong. One concurrency edge case with `Error` callback registration.

---

## Findings

### 1. `send()` crashes during reconnection window

**Severity:** High

```typescript
public override async send(message: JSONValue): Promise<void> {
    await this.waitForConnection(); // block until we are connected
    this.webSocket.get().send(JSON.stringify(message)); // throws if webSocket is empty
}
```

`connectionPromise` is resolved once on the first successful connection and is only reset in `disconnect()`. After an unexpected disconnect (server drop / network error), the socket is closed and `webSocket` is set to `MGPOptional.empty()`, but `connectionPromise` is never reset. Any `send()` call during reconnection therefore:
1. Awaits `waitForConnection()` — returns immediately (already resolved).
2. Calls `this.webSocket.get()` — throws because `webSocket` is absent.

**Recommendation:** Reset `connectionPromise` on unexpected disconnect (in `onerror`/`onclose` before `reconnect()`), mirroring what `disconnect()` does.

---

### 2. `onmessage` assertion comment and check are mismatched

**Severity:** Low

```typescript
Utils.assert(typeof(json) === 'object', // i.e., an array
             `Received malformed WebSocket message (not an object): ${JSON.stringify(json)}`);
```

The comment says "i.e., an array" but the assertion `typeof(json) === 'object'` accepts any JSON object (`{}`), not just arrays. The protocol expects a JSON array (tag at index 0, args at index 1). If the server accidentally sends a JSON object (`{}`), this assertion passes but `json[0]` returns `undefined`, causing the next assertion to fail with a confusing message.

**Recommendation:** Use `Array.isArray(json)` instead of `typeof === 'object'`, and update the error message accordingly.

---

### 3. `Error` callback conflict between `waitForMessage` and persistent `GameService` error handler

**Severity:** Medium

`waitForMessage` unconditionally calls `setCallback('Error', onMessage)`, and `setCallback` throws if the tag already exists:

```typescript
if (this.callbacks.containsKey(tag)) {
    throw new Error(`registering a callback which already exists (${tag}), this is likely not what we need!`);
}
```

In `GameService.subscribeTo`, an `Error` callback is registered for the lifetime of a game. If `sendAndWaitForReply` is later called while a game is active (e.g., future code path), the `waitForMessage` call would throw when trying to register a second `Error` callback.

Currently this conflict is avoided because `createGame` is only called before a game subscription is active, but the design is fragile — adding any `sendAndWaitForReply` call from within an active game context would immediately break.

---

### 4. `subscribeTo` teardown is async but Subscription does not await it

**Severity:** Low

```typescript
return new Subscription(async() => this.send(['Unsubscribe']));
```

`Subscription` teardown functions are not awaited by RxJS. If `send(['Unsubscribe'])` rejects, the error is silently dropped, and the server continues delivering events for the unsubscribed resource.

---

### 5. `BackendMessage.getArgument<T>` — no runtime type checking

**Severity:** Informational

```typescript
public getArgument<T>(name: string): T {
    const value: T | null = this.getOptionalArgument<T>(name);
    // ...
    return value;
}
```

The generic `<T>` is a compile-time alias with no runtime check. Any type mismatch between what the server sends and what the caller expects will only manifest as a runtime error later when the value is used.

---

## No Other Issues Found

- Exponential backoff (`nextConnectionAttemptTime *= 2`) is correct and reset on successful reconnect.
- The `timeout.isPresent()` guard in `reconnect` correctly handles the double-fire from `onerror` + `onclose` on the same socket.
- `waitForMessage` correctly removes both the success tag and `Error` callbacks after the first message resolves the promise.
- `setCallback` returning a `Subscription` whose teardown removes the callback is a clean pattern.
