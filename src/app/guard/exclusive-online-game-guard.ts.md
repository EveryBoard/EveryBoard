# Review: `guard/exclusive-online-game-guard.ts`

## Summary
Correct guard logic. One unused field and one inherited subscription-leak concern.

---

## Findings

### 1. `currentGameSubscription` is declared but never used

**Severity:** Low

```typescript
protected currentGameSubscription: MGPOptional<Subscription> = MGPOptional.empty();
```

This field is initialized but never assigned or read anywhere in the class. It appears to be leftover from a previous implementation.

**Recommendation:** Remove the field.

---

### 2. Inherits subscription leak from `getCurrentGame()`

**Severity:** Low (inherited from `CurrentGameService`)

`getCurrentGame()` leaks a subscription when the `ReplaySubject` fires synchronously (documented in `CurrentGameService.ts.md`). This guard calls it and thus accumulates one leaked subscription per guard activation.

---

## No Other Issues Found

- Route param comparison `route.params.id === game.id` correctly allows a player to re-navigate to their own current game.
- Redirect to `/play/${game.gameName}/${game.id}` uses controlled game names, so URL injection is not a concern.
