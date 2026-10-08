# Review: `games/gos/triangular-go/triangular-go.component.ts`

## Summary

Triangular Go component. One cosmetic finding (same `boardInfo` pattern as the other Go components).

---

## Findings

### 1. `boardInfo` declared but never assigned

**Severity:** Cosmetic

```typescript
public boardInfo: GroupData<GoPiece>;
```

Declared without an initializer and never assigned anywhere in this file. This is not a compiler error here because strictPropertyInitialization is disabled, but it is still a definite-assignment gap. Same pattern observed in `go.component.ts` and `hexagonal-go.component.ts`.

---

## No Other Issues Found

- `getViewBox()` correctly accounts for the triangular checker board's leftmost reachable column offset and handles both odd/even width board configurations.
- `pass()` correctly dispatches PASS for playing/passed phases and ACCEPT for counting/accept phases.
- `showCaptures()` correctly identifies captured pieces by cross-referencing previous state.
- `isUpward`/`isDownward` delegation to `TriangularCheckerBoard.isSpaceDark` is appropriate.
