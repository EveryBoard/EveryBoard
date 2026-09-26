# Review: `components/game-components/game-component/HexagonalGameComponent.ts`

## Summary
Abstract base for hexagonal game components. One note.

---

## Findings

### 1. `hexaLayout` and `hexaBoard` are uninitialized

**Severity:** Informational

```typescript
public hexaLayout: HexaLayout;
public hexaBoard: Table<P>;
```

Both fields have no initializer and no `!` definite assignment assertion. Subclasses are expected to set them in `updateBoard()`. This is not a compiler error here because `strictPropertyInitialization` is disabled, but these fields are still potentially undefined by type contract. This follows the same pattern as other uninitialized fields in the game component hierarchy — a contract enforced by convention rather than types.

---

## No Other Issues Found

- Helper methods `getHexaPoints`, `getCenterAt`, `getCenterAtXY`, and translation helpers are straightforward delegation.
