# Review: `components/BaseComponent.ts`

## Summary
Base class providing template utilities to all components. One design note.

---

## Findings

### 1. `ArrayUtils` and `MGPOptional` exposed as public instance fields for template access

**Severity:** Informational

```typescript
public ArrayUtils: typeof ArrayUtils = ArrayUtils;
public MGPOptional: typeof MGPOptional = MGPOptional;
```

Injecting static utility classes as instance fields to make them accessible in templates is a common Angular pattern. The cost is that every component instance carries an extra reference. Since these are class constructor references (not cloned objects), the memory impact is minimal. Acceptable but worth noting for maintainers unfamiliar with this pattern.

---

## No Other Issues Found

- `getPlayerClass` correctly handles `PlayerOrNone.NONE` via `Utils.expectToBe`.
