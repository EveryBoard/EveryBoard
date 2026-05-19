# Review: `games/diam/DiamState.ts`

## Summary
State for Diam with a 4-high, 8-wide stacking board. One issue found.

---

## Findings

### 1. `ofRepresentation` mutates the `representation` parameter via `Array.reverse()`

**Severity:** Medium

```typescript
const board: Table<DiamPiece> = representation.reverse();
```

`Array.prototype.reverse()` mutates the array in place and returns it. The caller's `representation` array is modified, and `board` is an alias to the same (now reversed) array. If the caller reuses `representation` after this call, it will see the reversed version. Should use `representation.slice().reverse()` or `[...representation].reverse()` to create an independent copy.

---

## No Other Issues Found

- `getStackHeight` correctly counts from `y=0` upward and stops at the first `EMPTY`.
- `pieceIndex` correctly guards against `EMPTY` at the call site before entering the switch.
