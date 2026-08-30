# Review: `games/gos/hexagonal-go/HexagonalGoRules.ts`

## Summary

Rules for Hexagonal Go. One cosmetic finding.

---

## Findings

### 1. `TableUtils` is imported via absolute `src/app/` path instead of a relative path

**Severity:** Cosmetic

```typescript
import { TableUtils } from 'src/app/jscaip/TableUtils';
```

All other imports in this file and across the codebase use relative paths (e.g., `'../../../jscaip/TableUtils'`). This absolute path depends on `tsconfig.json` path mappings and may break if the project root or path aliases change. Should be:

```typescript
import { TableUtils } from '../../../jscaip/TableUtils';
```

---

## No Other Issues Found

- Hexagonal board generation is correct: cells with anti-diagonal sum `x+y` in the range `(size-2, 3*size-2)` exclusive are set to EMPTY; others remain UNREACHABLE.
- `super(false)` correctly sets `playOnIntersection = false` for hexagonal Go (pieces placed on cells, not intersections).
