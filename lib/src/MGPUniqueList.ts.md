# Review: `lib/src/MGPUniqueList.ts`

## Summary

Ordered unique list implementation. One bounds-check issue found.

---

## Findings

### 1. Negative indexes are accepted by `get` and `getFromEnd`

**Severity:** Medium

```typescript
public get(index: number): T {
    Utils.assert(index < this.values.length, 'MGPUniqueList: index out of bounds: ' + index);
    return this.values[index];
}
```

Both `get` and `getFromEnd` only check the upper bound. A negative index passes the assertion. `get(-1)` returns `undefined` despite the `T` return type, and `getFromEnd(-1)` computes an index after the end and also returns `undefined`.

These methods should assert `0 <= index && index < this.values.length`.
