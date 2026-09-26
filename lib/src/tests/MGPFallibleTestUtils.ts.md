# Review: `lib/src/tests/MGPFallibleTestUtils.ts`

## Summary

Test helper for `MGPFallible`. One assertion gap found.

---

## Findings

### 1. `expectToBeSuccess` does not check explicit `null` or `undefined` expected values

**Severity:** Low

```typescript
if (arguments.length > 1 && value != null) {
    expect(fallible.get()).toBe(value);
}
```

Passing a second argument means the caller requested a value check, but the helper skips the check when the expected value is `null` or `undefined`. That can let a failing test pass for `MGPFallible.success(null)` or `MGPFallible.success(undefined)` with the wrong contained value.

The condition should use only `arguments.length > 1`.
