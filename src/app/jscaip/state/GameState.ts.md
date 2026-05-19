# Review: `jscaip/state/GameState.ts`

## Summary
Small but foundational class. No bugs found. One significant naming concern that propagates into all callers.

---

## Findings

### 1. Confusing aliased methods — high risk of misuse

**Severity:** Medium (naming / maintainability)

`getPreviousPlayer()` and `getPreviousOpponent()` are defined as exact aliases:

```typescript
public getPreviousOpponent(): Player {
    return this.getCurrentPlayer();   // same as getCurrentPlayer
}
public getPreviousPlayer(): Player {
    return this.getCurrentOpponent(); // same as getCurrentOpponent
}
```

These aliases are *mathematically* correct because with two alternating players the previous player is always the current opponent, and the opponent of the previous player is always the current player. However:

- A reader seeing `state.getPreviousPlayer()` in a Rules file expects it computes `Player.ofTurn(turn - 1)`. Instead it delegates to `getCurrentOpponent()`, which computes `turn % 2 === 1 ? Player.ZERO : Player.ONE`. The result is identical but the indirection is surprising.
- The symmetry makes it easy to accidentally swap `getPreviousPlayer()` and `getPreviousOpponent()` — both compile, both look plausible, but they return opposite players. QuixoRules uses both in the same method, making it a likely spot for a latent bug (see QuixoRules review).
- At turn 0 these methods still return a "previous player" even though no move has been made; callers that call win-condition logic before turn 1 would get a misleading result (though in practice win checks only run after applying a move, so turn ≥ 1).

**Recommendation:** Document explicitly in a comment that these are valid aliases and why, or replace them with a single `getPreviousPlayer(): Player { return Player.ofTurn(this.turn - 1); }` that is self-evident (JS `%` preserves sign, so `(-1) % 2 === -1`, which is non-zero and returns `Player.ONE` — correct for the conceptual "player before turn 0").

---

### 2. Missing comma in `GameStateAndConfig` type literal

**Severity:** Cosmetic / style

```typescript
export type GameStateAndConfig = {
    state: GameState;
    config: RulesConfig    // ← missing trailing semicolon/comma (semicolon style used elsewhere)
};
```

Line 6 is missing the trailing `;`. Minor but inconsistent with the rest of the codebase style.

---

## No Other Issues Found

- `getCurrentPlayer()` and `getCurrentOpponent()` are correct.
- The `turn` field is `readonly`, preventing accidental mutation.
- Import of `RulesConfig` is appropriate; no circular dependencies introduced here.
