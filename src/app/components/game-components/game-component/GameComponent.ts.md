# Review: `components/game-components/game-component/GameComponent.ts`

## Summary
Core game component base class. Many fields are left uninitialized (to be set by the wrapper), creating an implicit initialization contract. Two concrete issues: `showLastMoveAndRedraw` can throw on the initial state, and `@Debug.log` will assert-fail if any decorated subclass has getter/setter properties.

---

## Findings

### 1. `showLastMoveAndRedraw` calls `.get()` on `previousMove` without guard

**Severity:** Medium

```typescript
public async showLastMoveAndRedraw(): Promise<void> {
    const move: M = this.node.previousMove.get();
```

If `node.previousMove` is absent (e.g., initial state, turn 0), `.get()` throws. Callers that may invoke this on the initial state need to guard it externally. `cancelMove` (line 197) correctly guards with `if (this.node.previousMove.isPresent())` before calling `showLastMove`, but `showLastMoveAndRedraw` does not.

**Recommendation:** Add a guard: `if (this.node.previousMove.isAbsent()) return;`.

---

### 2. `@Debug.log` on subclasses will assert-fail if they have getter/setter properties

**Severity:** Medium (inherited from `Debug.ts.md`)

`@Debug.log` iterates `Object.getOwnPropertyNames(prototype)` and asserts every property is a method. Any subclass of `GameComponent` that uses `@Debug.log` and defines a TypeScript getter (`get myProp()`) will cause the assertion `'cannot add logging to properties that are not methods!'` to throw during class initialization, crashing the app.

---

### 3. Multiple public fields left uninitialized — implicit wrapper contract

**Severity:** Informational

```typescript
public encoder: Encoder<M>;
public rules: R;
public node: GameNode<M, S>;
public chooseMove: (move: M) => Promise<MGPValidation>;
// ... etc.
```

These fields are set by the wrapper before they're used. This is not a compiler error here because `strictPropertyInitialization` is disabled, but `!` assertions or defaults would make the wrapper initialization contract explicit. If the wrapper fails to set any of them, accessing them throws. This implicit initialization contract is risky but appears intentional — the alternative (making all fields Optional) would complicate every method in the class.

---

### 4. `setRulesAndNode` uses unsafe `as C` cast

**Severity:** Low

```typescript
const defaultConfig: C = gameInfo.getRulesConfig() as C;
this.rules = gameInfo.rules as R;
```

Both casts bypass TypeScript's type system. A mismatch between `urlName`'s expected config type and the actual `C` parameter would only surface at runtime.

---

## No Other Issues Found

- `cancelMove` correctly guards `showLastMove` with `if (this.node.previousMove.isPresent())`.
- `getArrowTransform` SVG transform ordering (`scale translation rotation`) is consistent with how SVG applies transforms left-to-right.
- `ScoreName` singleton pattern with `zero/singular/plural` handlers is clean i18n design.
