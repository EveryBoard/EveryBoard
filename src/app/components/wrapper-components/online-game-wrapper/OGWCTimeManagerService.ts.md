# Review: `components/wrapper-components/online-game-wrapper/OGWCTimeManagerService.ts`

## Summary
Clean timer management service. Two issues: magic-number time additions that don't use config values, and `lastMoveStart` can be accessed before game start.

---

## Findings

### 1. `addMoveTime` and `addGameTime` use hardcoded constants instead of config

**Severity:** Low

```typescript
private addMoveTime(player: Player): void {
    const secondsToAdd: number = 30;  // hardcoded
    ...
}
private addGameTime(player: Player): void {
    const secondsToAdd: number = 5 * 60;  // hardcoded
}
```

The amounts added (30s move time, 5min game time) are hardcoded. They don't reference the `ConfigRoom` (which is available in the service via `this.configRoom`). If these values change or are configurable per game type, both here and in the config must be updated separately.

---

### 2. `getSecondsElapsedSinceLastMoveStart` calls `lastMoveStart.get()` — throws before game start

**Severity:** Low

```typescript
private getSecondsElapsedSinceLastMoveStart(currentTime: number): number {
    return currentTime - this.lastMoveStart.get();
}
```

`lastMoveStart` is `MGPOptional.empty()` until `onGameStart` is called. If `onReceivedMove` or `afterEvent` are called before game start (shouldn't happen by protocol, but is not guarded), `.get()` throws.

---

### 3. `availableMoveTime` can go negative if move exceeds time limit

**Severity:** Informational

```typescript
this.availableMoveTime.subtract(player, takenMoveTime);
```

`PlayerNumberMap.subtract` can produce a negative value. A timer component receiving a negative duration would display negative time. This is likely handled by the timer component itself (clamp to zero), but it's worth confirming.

---

## No Other Issues Found

- `beforeEvent/afterEvent` pause/resume pattern is correct for sequential event processing.
- `onSync` correctly defers timer updates until synchronized with the server.
- `updateTimers` correctly computes remaining game time as `gameDuration + extraTime - takenTime`.
