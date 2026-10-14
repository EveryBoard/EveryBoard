# Review: `games/epaminondas/EpaminondasOrderedMoveGenerator.ts`

## Summary

Ordered move generator for Epaminondas (sorts by descending step size). One cosmetic finding.

---

## Findings

### 1. `EpaminondasConfig` used in method signature but not imported

**Severity:** Cosmetic

```typescript
public override getListMoves(node: EpaminondasNode, config: EpaminondasConfig): EpaminondasMove[] {
```

`EpaminondasConfig` appears in the parameter type but is not in the import list (which only imports `EpaminondasNode` from `./EpaminondasRules`). TypeScript may resolve this from the parent class definition via the override, but it should be imported explicitly:

```typescript
import { EpaminondasNode, EpaminondasConfig } from './EpaminondasRules';
```

---

## No Other Issues Found

- Sorting by descending `stepSize` (larger advances first) is a reasonable heuristic for Minimax move ordering.
- The comment `// Best for normal, might not be best for others!` acknowledges it is heuristic-specific.
