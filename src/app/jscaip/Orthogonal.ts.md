# Review: `jscaip/Orthogonal.ts`

## Summary
Clean. One minor naming ambiguity.

---

## Findings

### 1. `Ordinal.ORTHOGONALS` and `Orthogonal.ORTHOGONALS` coexist with different types

**Severity:** Informational

`Orthogonal.ORTHOGONALS: ReadonlyArray<Orthogonal>` and `Ordinal.ORTHOGONALS: ReadonlyArray<Ordinal>` provide the same four directions typed differently. Code that accidentally uses one where the other is expected gets a type error (caught by TypeScript), but the duplication could confuse new contributors about which to use.

---

## No Other Issues Found

- `rotateClockwise()` correctly implements 90° clockwise rotation: `(x, y) → (-y, x)`.
- `getOpposite()` correctly negates both components.
- `toOrdinal()` correctly maps each orthogonal to its ordinal counterpart.
