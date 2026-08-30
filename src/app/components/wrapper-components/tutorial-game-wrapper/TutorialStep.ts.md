# Review: `components/wrapper-components/tutorial-game-wrapper/TutorialStep.ts`

## Summary
Clean type hierarchy for tutorial steps using the type-narrowing "discriminated class" pattern. One concern: `withPreviousMove` mutates an otherwise-immutable step.

---

## Findings

### 1. `withPreviousMove` mutates `previousMove` and `parent` on a `readonly`-fielded object

**Severity:** Low

```typescript
public withPreviousMove(previousMove: Move, previousState?: GameState): this {
    this.previousMove = MGPOptional.of(previousMove);
    if (previousState != null) {
        this.parent = MGPOptional.of(new GameNode(previousState));
    }
    return this;
}
```

`previousMove` and `parent` are declared as `public` non-readonly fields initialized to `MGPOptional.empty()`. The builder pattern (`withPreviousMove` returning `this`) works but allows calling the mutator multiple times. Since tutorial steps are shared objects (created once and reused), a second call to `withPreviousMove` would overwrite the first, which may cause issues if steps are reused across test and tutorial runs.

---

### 2. `TutorialStepClick.getSolution()` returns `acceptedClicks[0]` — throws if array is empty

**Severity:** Low

```typescript
public getSolution(): Move | Click {
    return this.acceptedClicks[0];
}
```

`acceptedClicks` has no non-empty assertion (unlike `TutorialStepMove` which asserts `acceptedMoves.length > 0`). If a `TutorialStepClick` is created with an empty `acceptedClicks`, `getSolution()` returns `undefined` typed as `string`.

---

## No Other Issues Found

- `isMove() / isClick() / isPredicate() / isAnyMove() / isInformation() / hasSolution()` as type-narrowing overrides is a clean pattern that avoids `instanceof` checks.
- `TutorialStepMove` correctly asserts at least one accepted move.
