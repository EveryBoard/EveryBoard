# Review: `jscaip/TableUtils.ts`

## Summary
Solid utility class. Two crash-on-empty-table issues and one misleading comment.

---

## Findings

### 1. `getLeftmostMatchColumn` and `add` crash on empty tables

**Severity:** Low

```typescript
public static getLeftmostMatchColumn<T>(...): MGPOptional<number> {
    const width: number = table[0].length; // crashes if table = []
```
```typescript
public static add(left: Table<number>, right: Table<number>): number[][] {
    const width: number = left[0].length; // crashes if left = []
```

Both access `table[0]` without a guard. Same pattern as `GameStateWithTable.getWidth()`. For game boards this never fires in practice, but the invariant is not enforced.

---

### 2. `getLeftmostMatchColumn` comment is inaccurate

**Severity:** Cosmetic

The comment says "Return the column of the leftmost match in each line" but the method returns the **first x** across **all lines** (not per-line). The iteration order is column-major (outer loop on `x`), so it returns the leftmost column `x` such that *any* row has a match — not per-row leftmost columns.

---

### 3. `TableWithPossibleNegativeIndices.set` will throw if the same coord is set twice

**Severity:** Medium

```typescript
line.set(coord.x, value); // MGPMap.set throws if key exists
```

`MGPMap.set` throws `'Key X already exists in map!'` if the key is already present. If a caller tries to update an existing cell, this throws instead of overwriting. There is no `update` or `put` alternative on this class.

**Recommendation:** Use `line.containsKey(coord.x) ? line.put(coord.x, value) : line.set(coord.x, value)`, or expose a dedicated `update` method.

---

### 4. `TableWithPossibleNegativeIndices.[Symbol.iterator]` materialises a full copy

**Severity:** Low (performance)

Same issue as in `GameStateWithTable` — an intermediate array is built before the iterator is returned. A generator would avoid the allocation.

---

## No Other Issues Found

- `create`, `copy`, `map`, `equals`, `sum`, `contains`, `count`, `find` are all correct.
- `Table3DUtils.create` correctly nests `TableUtils.create` calls.
