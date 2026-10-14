# Review: `components/game-components/goban-game-component/blank-goban/blank-goban.component.ts`

## Summary
Standalone SVG goban rendering component. One inherited issue.

---

## Findings

### 1. `GobanUtils.getHoshis` produces negative coords for boards smaller than 5×5

**Severity:** Informational

Same issue as in `GobanGameComponent.ts.md` — `GobanUtils.getHoshis` can return negative coordinate values for small boards. `BlankGobanComponent` passes width/height signal values directly without any size guard.

---

## No Other Issues Found

- `ngOnChanges` correctly recomputes hoshis when width/height inputs change.
- `onClick` correctly emits a `Coord` from x/y parameters.
