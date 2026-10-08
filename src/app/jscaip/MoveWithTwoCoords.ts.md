# Review: `jscaip/MoveWithTwoCoords.ts`

## Summary
Clean base class. One encoder note.

---

## Findings

### 1. `getFallibleEncoder` silently drops failure on decode

**Severity:** Low

```typescript
(fields: [Coord, Coord]): M => generator(fields[0], fields[1]).get()
```

If `generator` returns a `MGPFallible.failure(...)`, calling `.get()` on it throws an unhandled error. This means a malformed encoded move (e.g., from a corrupted network packet or database record) will crash with an uncontrolled exception rather than a structured decode error.

The same pattern exists in `MoveCoord.getFallibleEncoder`. The `getFallibleEncoder` name implies fallibility in the *creation* path, but the failure is not propagated to the caller — it always throws.

**Recommendation:** If the library's `Encoder` interface doesn't support fallible decode, consider wrapping the decode in a try/catch and returning a sentinel or propagating the error.

---

## No Other Issues Found

- `first` and `second` fields are `private readonly` — correctly immutable.
- `getCoords()` returns a tuple, which is clear and type-safe.
