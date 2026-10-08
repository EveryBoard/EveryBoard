# Review: `jscaip/MoveCoord.ts`

## Summary
One significant design risk in `equals`, otherwise clean.

---

## Findings

### 1. `equals` only compares `coord` — silent bug risk for subclasses

**Severity:** Medium (design risk)

```typescript
public equals(other: this): boolean {
    return this === other || this.coord.equals(other.coord);
}
```

Any `MoveCoord` subclass that adds distinguishing fields (direction, piece type, etc.) and forgets to `override equals` will inherit this implementation, silently treating two moves with the same `coord` but different extra fields as equal. This would break move-deduplication in the AI tree (`MGPMap` keyed by move, alpha-beta child lookup, etc.).

All existing subclasses with extra fields (`QuixoMove`, `SiamMove`, `AbaloneMove`, `LodestoneMove`, `EpaminondasMove`, `PentagoMove`) do override `equals` correctly. However, the pattern is fragile — there is nothing in the type system to enforce the override.

**Recommendation:** Mark `equals` as `abstract` here and remove the default implementation, forcing every concrete subclass to explicitly implement it. Alternatively, add a TSDoc note on the method.

---

## No Other Issues Found

- Encoder helpers (`getFallibleEncoder`, `getEncoder`) correctly extract and reconstruct the `coord`.
- The `coord` field is `readonly`.
