# Review: `lib/src/Encoder.ts`

## Summary

Generic encoder helpers. One issue found in disjunction decoding.

---

## Findings

### 1. `disjunction.decode` accepts `type === encoders.length`

**Severity:** Medium

```typescript
Utils.assert(type_ <= encoders.length, `Encoders.disjunction got invalid data: ${type_} is not an existing type`);
return encoders[type_].decode(content) as U;
```

For an encoder with `N` variants, valid type indexes are `0..N-1`. The current check allows `type_ === N`, then indexes `encoders[N]`, which is `undefined`, and crashes with an unclear `Cannot read properties of undefined` error.

This affects all disjunction-based move codecs when decoding malformed replay/network data. The check should be `0 <= type_ && type_ < encoders.length`, and it should also reject non-number type values.
