# Review: `components/game-components/rectangular-game-component/RectangularGameComponent.ts`

## Summary
Abstract base for rectangular grid game components. No bugs found.

---

## Findings

### 1. `board` field is uninitialized

**Severity:** Informational

```typescript
public board: Table<P>;
```

Same pattern as other game components — `board` is set by subclasses in `updateBoard()`, not at declaration time. This is not a compiler error here because strictPropertyInitialization is disabled. The contract is enforced by convention.

---

## No Other Issues Found

- `getViewBox` correctly computes SVG viewbox with stroke expansion.
- `getWidth` and `getHeight` delegate to `GameStateWithTable` accessors.
