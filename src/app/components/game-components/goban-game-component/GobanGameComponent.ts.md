# Review: `components/game-components/goban-game-component/GobanGameComponent.ts`

## Summary
Abstract base for Go-board game components. One inherited issue.

---

## Findings

### 1. `createHoshis` delegates to `GobanUtils.getHoshis` which produces negative coords for very small boards

**Severity:** Informational

As noted in `GobanUtils.ts.md`, `GobanUtils.getHoshis` can return negative coordinates for boards with width/height < 5. `createHoshis` does not guard against this. If a subclass renders a small goban (< 5×5), the hoshi coordinates will be invalid and could render outside the board.

---

## No Other Issues Found

- `hoshis` is correctly initialized to an empty array.
- The docstring correctly specifies that `createHoshis` must be called after `this.board` is set.
