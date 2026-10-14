# Review: `games/gos/hexagonal-go/hexagonal-go.component.ts`

## Summary

Hexagonal Go component. One cosmetic finding (same pattern as `go.component.ts`).

---

## Findings

### 1. `boardInfo` declared but never assigned

**Severity:** Cosmetic

```typescript
public boardInfo: GroupData<GoPiece>;
```

`boardInfo` is declared without an initializer and is never assigned anywhere in this file. This is not a compiler error here because strictPropertyInitialization is disabled, but it is still a definite-assignment gap. The template may reference it (e.g., to show territory/group data), but if not, it is dead code. Same pattern observed in `go.component.ts`.

---

## No Other Issues Found

- `showLastMove` correctly guards PASS moves: `GoMove.PASS.coord` is `(-1, 0)`, which is outside any valid hex board, so it won't highlight a valid cell as "last move."
- `pass()` correctly dispatches PASS for playing/passed phases and ACCEPT for counting/accept phases.
- `showCaptures` correctly identifies captures: occupied-in-previous, empty-now, and not the ko point.
- `setHexaLayout` layout math looks correct for pointy-top hexagons.
