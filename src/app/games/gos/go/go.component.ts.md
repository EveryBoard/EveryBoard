# Review: `games/gos/go/go.component.ts`

## Summary

UI component for standard Go. One cosmetic finding.

---

## Findings

### 1. `boardInfo` declared but never assigned in this class

**Severity:** Cosmetic

```typescript
public boardInfo: GroupData<GoPiece>;
```

`boardInfo` is declared without an initializer and is never assigned anywhere in this file. If it is read in the template or parent class, it would be `undefined`. This is not a compiler error here because strictPropertyInitialization is disabled, but the missing initialization is still suspicious. Either it should be initialized, removed if unused, or marked with `!` if the parent class is responsible for setting it.

---

## No Other Issues Found

- `pass()` correctly generates `new GoMove(-1, 0)` (equal to `GoMove.PASS` by coordinates) and `new GoMove(-2, 0)` (equal to `GoMove.ACCEPT`); `isPass` / `isAccept` use `.equals()` (coordinate comparison), so singleton identity is not required.
- `showCaptures` correctly identifies captured squares as: previously occupied + now empty + not the ko coord.
- `canPass` is correctly updated to `phase.allowsPass()` on each board update.
