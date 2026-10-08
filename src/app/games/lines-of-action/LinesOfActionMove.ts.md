# Review: `games/lines-of-action/LinesOfActionMove.ts`

## Summary

Move for Lines of Action. One cosmetic finding.

---

## Findings

### 1. Direction computed twice; constructor parameter immediately overwritten

**Severity:** Cosmetic

```typescript
private constructor(start: Coord, end: Coord, public readonly direction: Ordinal) {
    super(start, end);
    this.direction = Ordinal.factory.fromMove(start, end).get();  // overwrites the parameter
}
```

The `direction` constructor parameter is assigned to `this.direction` by TypeScript's `public readonly` shorthand, but then immediately overwritten by the same computation already done in `from`. The parameter serves no purpose and the double computation is redundant.

---

## No Other Issues Found

- `from` validates both the direction and board bounds before constructing the move.
- The `.get()` in the constructor is safe because `from` already verified the direction is valid before calling `new LinesOfActionMove`.
