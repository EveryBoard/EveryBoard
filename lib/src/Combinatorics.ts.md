# Review: `lib/src/Combinatorics.ts`

## Summary

Combinatorics helpers. One side-effect issue found.

---

## Findings

### 1. `getPermutations` mutates its input array

**Severity:** Low

`getPermutations` implements Heap's algorithm by swapping elements in the `elements` parameter:

```typescript
const element: T = elements[i];
elements[i] = elements[k];
elements[k] = element;
```

The returned permutations are copied with `elements.slice()`, but the input array itself is left permuted after the call. For example, `[1, 2, 3]` ends as `[3, 2, 1]`.

This is surprising for a utility named `getPermutations`, and callers that reuse the original array after generating permutations can observe corrupted ordering. It should either work on a local copy or document and test the mutation explicitly.
