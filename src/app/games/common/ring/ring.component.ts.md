# Review: `games/common/ring/ring.component.ts`

## Summary
Reusable SVG ring component. One potential issue found.

---

## Findings

### 1. `insideStrokeInsideRadius` can go negative if `width` is large relative to `outsideRadius`

**Severity:** Informational

```typescript
private readonly insideStrokeInsideRadius: Signal<number> = computed(() =>
    this.midRingInsideRadius() - this.strokeWidth(),
);
```

If `outsideRadius - strokeWidth - width - strokeWidth < 0`, the inside stroke radius becomes negative. SVG circles with negative radii don't render and may produce errors in some browsers. Callers are responsible for providing consistent values, but there's no guard or assertion against this.

---

## No Other Issues Found

- Ring geometry (outer stroke, mid ring, inner stroke) is computed correctly.
- Signal-based reactivity is correctly used.
