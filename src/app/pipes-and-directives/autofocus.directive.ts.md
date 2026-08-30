# Review: `pipes-and-directives/autofocus.directive.ts`

## Summary
Simple autofocus directive. One minor timing note.

---

## Findings

### 1. `setTimeout(..., 1)` — 1ms delay is fragile

**Severity:** Informational

Using 1ms to defer focus assumes the DOM is ready in 1ms. On slow devices or during heavy rendering, this could fire before the element is fully laid out. A `setTimeout(..., 0)` (next tick) or `requestAnimationFrame` would be more semantically correct: "defer until after current rendering frame."

The comment says "0ms is enough" but then uses 1ms — a minor inconsistency.

---

## No Other Issues Found
