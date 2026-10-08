# Review: `components/wrapper-components/online-game-wrapper/online-game-wrapper.component.ts`

## Summary
Complex online game coordinator. Key issues: `getPlayer()` can throw for Google users without usernames, `moveSentButNotReceivedYet` flag is not cleared on send failure, and `setRealObserverRole` calling `.get()` on potentially null `players[1]`. The Mutex for sequential event handling is a correct design choice.

---

## Findings

### 1. `getPlayer()` throws for Google users without usernames

**Severity:** High

```typescript
public override getPlayer(): MinimalUser {
    return this.connectedUserService.user.get().toMinimalUser();
}
```

`toMinimalUser()` calls `this.username.get()` which throws if the username is absent (documented in `ConnectedUserService.ts.md`). Google accounts initially have no username. If a Google user is in an online game before setting their username, every call to `getPlayer()` throws — breaking `setRealObserverRole`, `canUserPlay`, `setCurrentPlayerAccordingToCurrentTurn`, etc.

---

### 2. `moveSentButNotReceivedYet` flag not cleared on send failure

**Severity:** Medium

```typescript
this.moveSentButNotReceivedYet = true;
await this.gameService.addMove(encodedMove);
```

If `addMove` throws (e.g., WebSocket disconnected), `moveSentButNotReceivedYet` remains `true`. The next received move (from the opponent) would be incorrectly treated as our own already-shown move and skipped, desynchronizing the displayed board from the actual game state.

**Recommendation:** Reset the flag in a `try/finally` or catch block.

---

### 3. `handleReply` for Rematch routes with untyped `reply.data`

**Severity:** Low

```typescript
await this.router.navigate(['/play', urlName, reply.data]);
```

`reply.data` is `JSONValue | undefined`. If it's a non-string (e.g., an object), the URL would be malformed. The rematch protocol requires `data` to be a string game ID, but this is not type-enforced — a future change to the reply protocol could silently break routing.

---

### 4. `setRealObserverRole` calls `.get()` on `players[1]` — throws if second player absent

**Severity:** Low

```typescript
this.opponent = this.players[1].get();
```

`players[1]` is initialized as `MGPOptional.ofNullable(game.playerOne)`. If `playerOne` is null (e.g., game was started before the second player joined — which should not happen by protocol, but...), `.get()` throws. Relies on the backend invariant that both players are set before `StartGame` is sent.

---

### 5. `startGame` timeout (2ms) is fragile for timer initialization

**Severity:** Low

```typescript
setTimeout(async() => {
    // the small waiting is there to make sure that the timers are loaded by view
    const createdSuccessfully = await this.createMatchingGameComponent();
    this.timeManager.setTimers([this.timerZeroMove()!, this.timerOneMove()!], ...);
}, 2);
```

2ms is not guaranteed to be enough for Angular to render the timer components. On slow devices or under heavy CPU load, the timers may not be in the DOM yet. `requestAnimationFrame` or `AfterViewInit` lifecycle hook would be more reliable.

---

## No Other Issues Found

- The `Mutex` ensures sequential processing of game events — prevents race conditions between concurrent async handlers.
- `applyMove` creating a new `GameNode` without `addChild` is intentional for online games (no AI uses the tree here).
- `onGameEvent` correctly uses `Utils.expectToBe` for exhaustiveness on the `Action` event type.
- `ngOnDestroy` correctly unsubscribes the game subscription.
