# Review: `components/normal-component/timer/timer.component.ts`

## Summary
Countdown timer component with pause/resume semantics. Two issues found.

---

## Findings

### 1. `remainingSeconds` and related display fields are uninitialized

**Severity:** Medium

```typescript
public remainingSeconds: number;
public displayedSec: number;
public displayedMinute: number;
private startTime: number;
```

All four fields are declared without initialization. This is not a compiler error in this repo because `strictPropertyInitialization` is disabled, but `remainingSeconds` is read in `getTimeClass()` and `updateShownTime()`. If the timer component is rendered or resumed before `setDuration()` is called, reading `remainingSeconds` gives `undefined`, causing `NaN` comparisons. They should be initialized to `0` or gated.

---

### 2. `resume()` asserts `started === true`, but `start()` calls `resume()` before the assertion applies

**Severity:** Informational

```typescript
public resume(): void {
    Utils.assert(this.isPaused && this.started, 'Should only resume timers that are started and paused!');
    ...
}

public start(): void {
    ...
    this.started = true;
    this.resume(); // OK: started is true here
}
```

The order in `start()` — set `this.started = true` then call `this.resume()` — is correct, but fragile. If the order were swapped, the assertion would fire. A minor structural concern, not an actual bug.

---

## No Other Issues Found

- Timer cleanup in `ngOnDestroy` correctly clears both timeout handles.
- `pause()` correctly calls `updateShownTime()` to sync elapsed time before stopping.
- `countSeconds()` at 300ms polling is a reasonable strategy for smooth countdown display.
- `getTimeClass()` blinking at sub-second granularity (`remainingSeconds % 2 < 1`) is intentional for visual urgency.
