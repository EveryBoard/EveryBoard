# Review: `jscaip/Coord3D.ts`

## Summary
Clean subclass. One latent type-mismatch concern with the `equals` override.

---

## Findings

### 1. `equals` override narrows parameter type — potential `undefined` comparison

**Severity:** Low

```typescript
public override equals(other: Coord3D): boolean {
    ...
    return other.z === this.z;
}
```

`Coord.equals` accepts a `Coord`, but `Coord3D.equals` overrides it with the narrower `Coord3D`. If called from code typed as `Coord` where the argument is a plain `Coord` (no `z`), `other.z` evaluates to `undefined`, and `this.z === undefined` is always `false`. This means mixed-type equality (a `Coord3D` against a plain `Coord` with the same x,y) silently returns `false` rather than throwing or being well-defined.

In practice, `Coord3D` values are only compared with other `Coord3D` values (e.g., inside `Pylos` game sets), so no current bug. But the narrowed override is fragile.

---

## No Other Issues Found

- `isHigherThan` correctly compares only the `z` axis.
- `of()` factory method is a clean alternative to `new Coord3D(...)`.
