# Review: `jscaip/AI/Minimax.ts`

## Summary
Alpha-beta implementation is correct. One design concern with the public `random` field, and the `|| bestChildren.length === 0` guard is necessary (not dead code).

---

## Findings

### 1. `random` field is public and mutable — silent behaviour change

**Severity:** Low

```typescript
public random: boolean = false;
```

Any caller can flip the AI to random-move mode. This is likely only used in testing, but making it public on the production type means production code could accidentally enable it. Consider exposing it only via a constructor option or a subclass.

---

### 2. `chooseNextMove` traverses to the best child's ancestor — off-by-one fragile

**Severity:** Low (correct but fragile)

```typescript
while (bestDescendant.gameState.turn > node.gameState.turn + 1) {
    bestDescendant = bestDescendant.parent.get();
}
return bestDescendant.previousMove.get();
```

`alphaBeta` returns the best *leaf* node, which is at depth `maxDepth` from the root. This loop climbs back to `node.turn + 1` (the direct child). If `alphaBeta` returns `node` itself (e.g., depth=0 or endgame immediately), `bestDescendant.previousMove.get()` would throw (root has no previous move). The caller asserts `!isEndGame` before calling, but depth=0 is not guarded.

**Recommendation:** Add `Utils.assert(options.maxDepth >= 1, ...)` in `chooseNextMove`.

---

### 3. `getOrCreateChild` asserts legality of moves from `MoveGenerator` — correct design

**Severity:** Informational

```typescript
Utils.assert(legality.isSuccess(), 'The minimax ... has proposed an illegal move ...');
```

This assertion catches move generators that produce invalid moves, which is a programmer error. Correct.

---

## No Other Issues Found

- Alpha-beta pruning logic is correct (verified against standard alpha-beta for both minimiser and maximiser).
- `getExpectedExtremum` correctly initialises to `+Infinity` for minimiser and `-Infinity` for maximiser.
- Score caching via `setCache`/`getCache` with `this.name + '-score'` key is correct (multiple Minimaxes with different names can coexist on the same tree).
