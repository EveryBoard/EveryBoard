# Review: `components/game-components/parallelogram-game-component/ParallelogramGameComponent.ts`

## Summary
Abstract base for 3D parallelogram-rendered game components (like Pylos). No bugs found.

---

## Findings

### 1. `getState().getHeight()` in `getCoordTranslation` could fail on unset state

**Severity:** Informational

```typescript
const numberOfOffset: number = this.getState().getHeight()-y;
```

`getState()` is inherited from `GameComponent`. If called before `updateBoard` has been invoked (e.g., during initial rendering), the state may not be set and `getState()` could throw or return a stale value. This is the same uninitialized-state pattern seen in other game components.

---

## No Other Issues Found

- `getParallelogramCoords` geometry is correct for a parallelogram with the given ratios.
- `getCoordTranslation` correctly accounts for stacking (z-axis) and row offset.
