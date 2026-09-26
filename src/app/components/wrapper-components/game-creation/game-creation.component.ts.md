# Review: `components/wrapper-components/game-creation/game-creation.component.ts`

## Summary
Large component managing online game creation lobby. Several edge cases and naming inconsistencies found. Two original snippets were stale and have been corrected against the current source.

---

## Findings

### 1. `getUserFromName` throws if candidate not found

**Severity:** Medium

```typescript
const candidate: Candidate | undefined = this.candidates.find(
    (c: Candidate) => c.user.name === username);
return Utils.getNonNullable(candidate).user;
```

If the chosen name is no longer present in `this.candidates` (for example because the candidate left between rendering and click handling), `Utils.getNonNullable(candidate)` throws instead of surfacing a user-facing error. The normal UI path only offers current candidates, so this is an edge case rather than a high-severity bug.

---

### 2. `proposeConfig` sends empty config object when config is absent

**Severity:** Medium

```typescript
return this.configRoomService.proposeConfig({
    gameType: gameType as GameType,
    firstPlayer: firstPlayer as FirstPlayer,
    moveDuration,
    gameDuration,
    rulesConfig: this.rulesConfig.getOrElse({}),
});
```

If `rulesConfig` is absent (not yet loaded), the proposed config is `{}`. This is valid for games with an empty config, but invalid for configurable games. The UI usually disables proposing until the configuration component emits a value, but this method itself has no guard.

---

### 3. Redundant null check in `isGameStarted`

**Severity:** Cosmetic

```typescript
Utils.assert(this.configRoom != null, '...');
const configRoom: ConfigRoom = Utils.getNonNullable(this.configRoom);
```

`Utils.assert` already verifies non-null; `Utils.getNonNullable` immediately after is redundant. A simple cast or direct use after the assert suffices.

---

### 4. `onGameCancelled` vs `onGameCanceled` naming inconsistency

**Severity:** Cosmetic

The method at line ~182 is named `onGameCancelled` (British spelling) while the subscription callback reference at line ~379 uses `onGameCanceled` (American spelling), or vice versa. Inconsistent spelling across a single codebase is confusing.

---

### 5. `void this.onError(error)` silently drops errors from the error handler

**Severity:** Informational

```typescript
void this.onError(error);
```

If `onError` itself throws or rejects, the error is silently swallowed. This is especially problematic in the context of error handling — a failure inside the error handler is undetectable.

---

## No Other Issues Found

- Config room subscription/unsubscription lifecycle appears correct.
- Candidate/joiner management logic is consistent aside from the stale-candidate edge case above.
