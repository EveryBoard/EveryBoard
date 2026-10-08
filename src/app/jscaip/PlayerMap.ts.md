# Review: `jscaip/PlayerMap.ts`

## Summary
Sound design. One confusing return type in `PlayerNumberMap`.

---

## Findings

### 1. `PlayerNumberMap.add`/`subtract` return old value, not new value

**Severity:** Low (confusing API)

```typescript
public add(player: Player, value: number): MGPOptional<number> {
    const oldValue: number = this.get(player);
    return this.map.put(player, oldValue + value); // returns MGPOptional<oldValue>
}
```

The return type is `MGPOptional<number>` from `MGPMap.put()`, which returns the *previous* value, not the new accumulated value. Callers expecting the new value would use the return incorrectly. The `MGPOptional<number>` wrapper is also unnecessary — since both players are always initialized, `map.put` always returns `MGPOptional.of(oldValue)`, never empty.

**Recommendation:** Change return type to `void` (callers can call `get(player)` if they need the new value), or return the new value directly: `return oldValue + value`.

---

### 2. `PlayerMap.put` return value is also the old value

**Severity:** Low

Same pattern as above — `PlayerMap.put` returns the result of `map.put(...).get()`, which is the old value. The method name `put` conventionally implies write-only semantics; returning the old value is surprising.

---

## No Other Issues Found

- `get(player)` correctly delegates and `get()` will never throw since both players are always initialized.
- `makeImmutable()` correctly delegates to the underlying map.
- `PlayerNumberMap.toTable()` correctly wraps values in `PlayerNumberTable.ofSingle`.
- `getCopy()` correctly deep-copies the underlying map.
