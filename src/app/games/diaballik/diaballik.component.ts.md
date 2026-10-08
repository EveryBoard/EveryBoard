# Review: `games/diaballik/diaballik.component.ts`

## Summary
Diaballik UI component with incremental sub-move construction. Two issues found.

---

## Findings

### 1. `stateInConstruction` is declared without initialization

**Severity:** Cosmetic

```typescript
public stateInConstruction: DiaballikState;
```

The field is first assigned in `updateBoard` (line 84) and `cancelMoveAttempt` (line 134). This is not a compiler error here because strictPropertyInitialization is disabled, but it remains a potential undefined access. Should be initialized to `this.getState()` at declaration or in the constructor (like `WIDTH` and `HEIGHT` are).

---

### 2. "MCTS (3, no dups)" AI uses `avoidDuplicates=false`

**Severity:** Medium

```typescript
new MCTS($localize`MCTS (3 only)`, new DiaballikFilteredMoveGenerator(3, false), this.rules),
new MCTS($localize`MCTS (without dups)`, new DiaballikMoveGenerator(true), this.rules),
new MCTS($localize`MCTS (3, no dups)`, new DiaballikFilteredMoveGenerator(3, false), this.rules),
```

The "MCTS (3, no dups)" entry uses `DiaballikFilteredMoveGenerator(3, false)` — `avoidDuplicates=false` — which is the same as "MCTS (3 only)". The label suggests duplicate states should be filtered out, which would require `true`. This appears to be a copy-paste error. Additionally, "MCTS (without dups)" on line 73 uses `DiaballikMoveGenerator(true)` — all move lengths, no duplicates. The "3, no dups" variant was presumably intended to be `DiaballikFilteredMoveGenerator(3, true)`.

---

## No Other Issues Found

- `done()` safely indexes `subMoves[0]` because the Done button is only shown when `subMoves.length >= 1`.
- `performPass` and `performTranslation` correctly chain sub-move legality checks against `stateInConstruction`.
