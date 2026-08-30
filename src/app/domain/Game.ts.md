# Review: `domain/Game.ts`

## Summary
Clean game domain types. One minor note about discriminated union completeness.

---

## Findings

### 1. `GameEvent` discriminated union does not use `never` exhaustiveness check

**Severity:** Informational

```typescript
export type GameEvent = GameEventReply | GameEventRequest | GameEventAction | GameEventMove;
```

Any switch on `event.eventType` should use a `never`-typed default case to catch future additions (e.g., if a new event type is added). Without this, new event types are silently unhandled. This is a pattern concern for consumers of `GameEvent`, not a type definition bug.

---

## No Other Issues Found

- All four `GameEvent` variants correctly narrow via `eventType` as a discriminant.
- `GameResult` namespace constants cover all possible outcomes.
- `beginning` as a `number` (Unix timestamp) is appropriate.
