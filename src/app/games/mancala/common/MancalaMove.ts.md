# Review: `games/mancala/common/MancalaMove.ts`

## Summary

Move representation for Mancala family. One decoder edge-case found.

---

## Findings

### 1. `MancalaMove.encoder` does not reject an empty distribution list

**Severity:** Medium

```typescript
(value: [MancalaDistribution[]]) => MancalaMove.of(value[0][0], value[0].slice(1)),
```

`MancalaMove.of` expects a mandatory first distribution, but the decoder never checks that `value[0]` is non-empty. If a malformed payload decodes as `[]`, `value[0][0]` is `undefined`, and `MancalaMove.of(undefined, [])` creates a move whose `distributions` array contains `undefined`. The constructor only asserts `distributions.length > 0`, so this invalid move survives construction and can later crash rule code that reads `distribution.x`.

The decoder should assert or fail when the decoded distribution list is empty.

---

## No Other Issues Found

- `MancalaMove.encoder` round-trips valid moves correctly: serializes as `[MancalaDistribution[]]` and reconstructs via `of(value[0][0], value[0].slice(1))`. ✓
- `MancalaDistribution.of` asserts `0 <= x` — rejects negative column indices at construction time. ✓
- `add` correctly appends to the bonus distributions list (not the mandatory first distribution). ✓
- `equals` uses `ArrayUtils.equals` which delegates to each `MancalaDistribution.equals`. ✓
- `Symbol.iterator` correctly exposes all distributions for `for...of` loops. ✓
