# Review: `games/checkers/common/CheckersMove.ts`

## Summary
Checkers move class for steps and multi-captures. One issue found.

---

## Findings

### 1. `getSteppedOverCoords` includes the starting coord in `jumpedOverCoords` from the start

**Severity:** Informational

```typescript
let jumpedOverCoords: MGPUniqueList<Coord> = new MGPUniqueList([steppedOn[0]]);
```

The starting coordinate is added to the "jumped over" list immediately. If the path revisits the starting square (e.g., loops back), it would be flagged as a duplicate. This is probably the intended behavior (you can't land on your starting square), but the semantics of the check — "you cannot capture twice the same coord" — is actually checking if you revisit any coord on the path, including the start.

---

## No Other Issues Found

- `getRelation` correctly implements prefix/equality comparison.
- `concatenate` correctly merges two moves via the shared endpoint.
- `encoder` correctly handles both steps and captures.
