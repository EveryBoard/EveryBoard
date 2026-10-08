# Review: `jscaip/PlayerNumberTable.ts`

## Summary
One bounds-check gap; otherwise clean.

---

## Findings

### 1. `add` has no bounds check on `index`

**Severity:** Medium

```typescript
public add(player: Player, index: number, value: number): MGPOptional<readonly number[]> {
    const list: number[] = ArrayUtils.copy(this.get(player).get());
    list[index] += value;   // ← no bounds check
    return this.put(player, list);
}
```

If `index >= list.length`, JavaScript creates a sparse array (index becomes `NaN` after `undefined + value`). The corrupt list is then stored back into the table with `put`. No error is thrown — the corruption is silent.

**Recommendation:** Add `Utils.assert(index >= 0 && index < list.length, 'PlayerNumberTable.add: index out of range')`.

---

### 2. `add` return value is the old player array (from `put`)

**Severity:** Low (same as `PlayerMap.put`)

`this.put(player, list)` returns the old array, not the new one. Callers expecting the updated list would be confused.

---

## No Other Issues Found

- `concat` correctly concatenates both players' arrays.
- `ofSingle` correctly wraps scalar values in single-element arrays.
