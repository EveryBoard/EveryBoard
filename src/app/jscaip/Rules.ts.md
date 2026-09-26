# Review: `jscaip/Rules.ts`

## Summary
One caching/design gap (missing `addChild` call), one dead assertion, and one architectural note.

---

## Findings

### 1. `choose()` creates a child node but never registers it with the parent

**Severity:** Low (caching/design gap)

```typescript
const resultingState: S = this.applyLegalMove(move, node.gameState, config, legality.get());
const child: GameNode<M, S> = new GameNode(resultingState, MGPOptional.of(node), MGPOptional.of(move));
return MGPFallible.success(child);
// ← node.addChild(child) is never called
```

`GameNode.addChild()` is the method that registers a child so it can later be retrieved by `node.getChild(move)`. The `Minimax.getOrCreateChild()` calls `node.addChild(newChild)` correctly. But `Rules.choose()` never does, so:

- Repeated `choose()` calls with the same move on the same node each create a new `GameNode`, re-running `isLegal` and `applyLegalMove` every time.
- The existing `node.getChild(move)` lookup in `choose()` line 39 can only ever hit if Minimax has pre-computed that child — never if `choose()` itself computed it first.

The tree-reuse optimization on lines 39–45 is therefore only a one-way caching: AI → player, not player → AI or player → player. This is real, but it is not a rules correctness bug: callers receive a valid child with its `parent` and `previousMove` set, and AI implementations register their own generated children. The impact is repeated work and surprising cache behavior.

**Recommendation:** Add `node.addChild(child)` before returning the new child.

---

### 2. Redundant (dead) assertion inside `choose()`

**Severity:** Low (dead code)

```typescript
const legality = this.isLegal(move, node.gameState, config);
if (legality.isFailure()) {
    return MGPFallible.failure(legality.getReason()); // ← returns early
}
const choice = node.getChild(move);
if (choice.isPresent()) {
    Utils.assert(legality.isSuccess(), ...); // ← always true here; legality.isFailure() returned above
    return MGPFallible.success(choice.get());
}
```

The `Utils.assert` on the cached-child path can never fail: control only reaches it if `legality.isFailure()` was false. This is dead code and adds noise.

**Recommendation:** Remove the assertion.

---

### 3. `ConfigurableRules` adds no behaviour — documentation gap

**Severity:** Informational

`ConfigurableRules<M, S, C, L>` is declared as a subclass of `SuperRules<M, S, C, L>` with zero added members. Its sole purpose appears to be naming — games with configurable rules extend `ConfigurableRules`, games without extend `Rules`. This is a valid design, but there is no comment explaining the naming intent, which leaves future contributors wondering if there is missing implementation.

---

## No Other Issues Found

- `getDefaultRulesConfig()` correctly delegates to the description.
- `AbstractRules` correctly uses `unknown` for `L` to enable type-erased callers.
