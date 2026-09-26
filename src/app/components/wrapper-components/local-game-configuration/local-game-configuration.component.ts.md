# Review: `components/wrapper-components/local-game-configuration/local-game-configuration.component.ts`

## Summary
Configuration screen before starting a local game. Two issues found.

---

## Findings

### 1. `configDemo` is uninitialized and accessed before `setConfigDemo` is called

**Severity:** Medium

```typescript
public configDemo: DemoNodeInfo;
```

`configDemo` has no initial value. `getConfigDemo()` returns it directly, and the template likely binds to it. If the component renders before `updateConfig` is called (possible during first change detection pass), accessing `configDemo` returns `undefined`, which could crash the `DemoCardWrapperComponent` receiving it as a required input signal.

---

### 2. `getGameName().get()` in `setConfigDemo` throws if game name is absent

**Severity:** Medium

```typescript
title: this.getGameName().get(),
```

`getGameName()` returns an `MGPOptional<string>`. Calling `.get()` without a presence check throws if the game name hasn't been set yet. Should use `.getOrElse('')` or guard with `isPresent()`.

---

## No Other Issues Found

- Config-to-query-param serialization via `JSON.stringify` is correct and reversible.
- Skipping navigation for empty config (`{}`) correctly handles unconfigurable games.
- `comparableEquals` used for deep config comparison avoids reference equality pitfalls.
