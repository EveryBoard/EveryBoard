# Review: `games/new-game/NewGameMove.ts`

## Summary

Template move type for the scaffold game. One issue found: the encoder is left undefined while the component uses it.

---

## Findings

### 1. `NewGameMove.encoder` is `undefined as any`

**Severity:** Medium

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
public static encoder: Encoder<NewGameMove> = undefined as any;
```

`NewGameComponent` assigns this value to `this.encoder`, and `NewGameMove.spec.ts` expects `NewGameMove.encoder` to be bijective. Any path that serializes, deserializes, or tests a `NewGameMove` will fail at runtime because the encoder object is undefined.

Even if this is intended as scaffold code, it lives in `src/app/games/new-game` with component, rules, minimax, and tests. It should either provide a trivial constant encoder for the single move value or be excluded from executable/tested game code.
