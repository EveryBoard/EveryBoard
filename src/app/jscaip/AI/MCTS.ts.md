# Review: `jscaip/AI/MCTS.ts`

## Summary
The MCTS implementation has a fundamental correctness issue in backpropagation for 2-player games, plus a debug-log bug. The structure is otherwise well-organized.

---

## Findings

### 1. Backpropagation does not alternate perspective — Bug

**Severity:** High

```typescript
private backpropagate(path: GameNode<M, S>[], winScore: number): void {
    for (const node of path) {
        this.addSimulationResult(node, winScore);  // same score for all nodes
    }
}
```

`winScore` is computed from the perspective of the root player: `1` if root player wins, `0` if they lose. This score is added to **every** node in the path — including nodes where the opponent is the current player.

Standard 2-player MCTS alternates the win score at each level. For minimiser nodes, the complement (`1 - winScore`) should be accumulated, because a win for the root player is a loss for the opponent. Without this alternation, `wins/simulations` at a minimiser's node reflects the root player's win rate, not the local player's. The UCB selection at minimiser nodes then picks children that are best for the root player — the opponent cooperates rather than plays adversarially.

**Recommendation:** Negate the win score at each step:
```typescript
private backpropagate(path: GameNode<M, S>[], winScore: number): void {
    let score: number = winScore;
    for (const node of path.slice().reverse()) {  // root last
        this.addSimulationResult(node, score);
        score = 1 - score; // alternate perspective
    }
}
```

---

### 2. `select` debug log uses `node` instead of `n` for UCB values

**Severity:** Low (debug-only bug)

```typescript
Debug.display('MCTS', 'select', 'UCB values: ' +
    (node.getChildren().map((n) => n.id + ': ' + this.ucb(node, simulations))));
//                                                           ^^^^ should be n
```

The log computes `ucb(node, ...)` (the parent) for each child `n`, producing identical values for all children. The actual selection on the next line correctly uses `ucb(n, simulations)`. This only affects debug output.

---

### 3. `winRatio` calls `this.simulations(node)` twice

**Severity:** Cosmetic

```typescript
const simulations: number = this.simulations(node);
if (this.simulations(node) === 0) {   // redundant call
```

Use the already-computed `simulations` variable.

---

### 4. `expand` creates ALL children at once (full expansion)

**Severity:** Informational

Standard MCTS creates one new child per expansion (progressive widening). This implementation creates all children in one step. For games with many legal moves (e.g., Go on a large board), this expands hundreds of nodes per iteration, consuming memory and slowing initial iterations significantly.

---

## No Other Issues Found

- `simulate` is never called on the root node (root has no `previousMove`), so `.get()` is safe.
- `ucb` correctly returns `+Infinity` for unsimulated nodes, ensuring unexplored nodes are always visited first.
- `winScore` returning 0.5 for timeout (`ONGOING`) is a reasonable "draw" heuristic.
- `play` in simulation does not add nodes to the tree (only `expand`'s `play` calls are added via `node.addChild`).
