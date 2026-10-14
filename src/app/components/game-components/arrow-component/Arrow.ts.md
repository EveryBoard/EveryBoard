# Review: `components/game-components/arrow-component/Arrow.ts`

## Summary
Clean data class for arrow rendering. One note about the magic number 150 in the angle computation.

---

## Findings

### 1. `dir.getAngle() + 150` — magic number without explanation

**Severity:** Informational

```typescript
const angle: number = dir.getAngle() + 150;
```

The `+150` offset is unexplained. It presumably aligns the arrowhead SVG polygon with the correct direction. A comment explaining the geometry (e.g., "the arrow SVG is drawn pointing at 30°, so we subtract 30° by adding 150° to get the correct orientation") would help maintainers.

---

## No Other Issues Found

- `transformation` combines rotation (around the landing center) then translation to the landing center — standard SVG arrow positioning.
- `DirArrowComponent` and `HexArrowComponent` are clean wrappers with required signal inputs.
