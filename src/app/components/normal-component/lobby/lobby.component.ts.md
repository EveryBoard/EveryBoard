# Review: `components/normal-component/lobby/lobby.component.ts`

## Summary
Lobby component managing active game rooms. Three issues found.

---

## Findings

### 1. `getGameName` throws if `urlName` not recognized

**Severity:** Medium

```typescript
public getGameName(configRoom: ConfigRoom): string {
    return GameInfo.getByUrlName(configRoom.gameName).get().name;
}
```

`.get()` on the `MGPOptional` returned by `getByUrlName` throws if the game name is unknown (e.g., stale/deleted game entries in Firestore). Should use `.getOrElse('Unknown Game')` or similar.

---

### 2. `ngOnInit` is `async` but not awaited by Angular lifecycle

**Severity:** Informational

```typescript
public async ngOnInit(): Promise<void> { ... }
```

Angular does not await async `ngOnInit`. The `subscribeToLobby()` call is awaited inside the method, but if it rejects (or anything before it throws), the rejection is silently ignored. The `lobbySubscription`, `errorSubscription` fields remain uninitialized in `ngOnDestroy` if the async path fails mid-way, leading to a null-dereference crash on destroy.

---

### 3. `Error` callback is registered after `subscribeToLobby`

**Severity:** Medium

```typescript
this.lobbySubscription = await this.backendService.subscribeToLobby();
this.errorSubscription = this.backendService.setCallback('Error', async(message: BackendMessage): Promise<void> => {
    await this.onError(message.getArgument('reason'));
});
```

If the backend replies to `SubscribeLobby` with an `Error` before `setCallback('Error', ...)` runs, the message is routed with no callback and only logged as "MESSAGE WITHOUT CALLBACK". This is the same ordering race documented in `GameService` and `ConfigRoomService`.

---

## No Other Issues Found

- All four subscriptions are properly unsubscribed in `ngOnDestroy` if `ngOnInit` completed successfully.
- `joinGame` correctly delegates join validation to `currentGameService.canUserJoin`.
- `selectTab` correctly gates the 'create' tab behind `canUserCreate`.
