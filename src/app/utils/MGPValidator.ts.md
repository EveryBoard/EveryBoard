# Review: `utils/MGPValidator.ts`

## Summary
Small validator utility. One type unsafety between the declared type signature and actual usage.

---

## Findings

### 1. `MGPValidator` type accepts `null | string` but `range` only handles `number`

**Severity:** Low

```typescript
export type MGPValidator = (v: number | string | null) => MGPValidation;

// But range returns a function typed as:
return (value: number) => { ... }
```

The `range` validator's inner function is typed as `(value: number) => MGPValidation`, but the `MGPValidator` type accepts `number | string | null`. TypeScript coerces this (a narrower parameter type is assignable to a wider one in this context since it's a callback), but callers who pass `string` or `null` would violate the assumption, causing incorrect comparisons at runtime (`"5" < 3` is `false` in JS; `null < 3` is `true`).

**Recommendation:** Either type `MGPValidator` as `(v: number) => MGPValidation` for numeric validators, or add a runtime type guard in `range`.

---

## No Other Issues Found

- `max < value` (rather than `value > max`) is a consistent style choice.
- Failure messages are correctly internationalized with `$localize`.
