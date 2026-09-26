# Review: `components/wrapper-components/tutorial-game-wrapper/tutorial-game-wrapper.component.ts`

## Summary
Well-structured tutorial wrapper. Two issues: `showSolution` for click steps can throw if the CSS selector matches no element, and `showSolution` for move steps calls `.get()` on the choose result without a guard.

---

## Findings

### 1. `showSolution` throws if click solution selector matches no element

**Severity:** Medium

```typescript
const element: HTMLElement = window.document.querySelector(solution) as HTMLElement;
element.dispatchEvent(new Event('click'));
```

`querySelector` returns `null` if no element matches `solution`. The cast `as HTMLElement` bypasses TypeScript's null check, and calling `element.dispatchEvent(...)` throws `TypeError: Cannot read properties of null`. If a tutorial step's click solution contains an incorrect CSS selector (e.g., after a template refactor), this crashes silently.

**Recommendation:** Guard with `if (element == null) { Utils.logError(...); return; }`.

---

### 2. `showSolution` calls `.get()` on `rules.choose()` without guard

**Severity:** Low

```typescript
this.gameComponent.node = this.gameComponent.rules.choose(this.gameComponent.node, solution, config).get();
```

If the tutorial step's solution move is illegal in the current state (e.g., tutorial step data is wrong), `.get()` on the failed `MGPFallible` throws. The tutorial's solution must always be a valid move at the step's starting state.

---

## No Other Issues Found

- `next()` termination: the loop `while (this.stepFinished[indexUndone])` cannot infinite-loop because the `successfulSteps < stepFinished.length` precondition ensures at least one `false` element.
- `showStep` correctly resets `stepFinished[stepIndex] = false` to allow re-attempting a step.
- `canUserPlay` for click steps correctly marks `moveAttemptMade = true` to prevent double-clicking.
