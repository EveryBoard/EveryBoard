# Review: `jscaip/BoardData.ts`

## Summary
The flood-fill logic is intentionally designed (neighbors of all colors are catalogued, recursion only follows same-color cells). One real bug found in `GroupData.insert` and one crash on empty board.

---

## Findings

### 1. `GroupData.insert` is not a correct sorted insertion — Bug

**Severity:** High

```typescript
public static insert(list: Coord[], coord: Coord): Coord[] {
    if (list.length === 0) {
        return [coord];
    } else {
        const first: Coord = list[0];
        if (coord.compareTo(first) < 0) {
            return [coord].concat(list);   // prepend
        } else {
            return list.concat([coord]);   // append
        }
    }
}
```

This only compares `coord` against the **first** element of the list. For a list with 2+ elements, a new coord that is greater than `list[0]` but smaller than `list[last]` is unconditionally appended at the end, breaking sort order.

Example: `list = [Coord(1,1), Coord(1,3)]`, `coord = Coord(1,2)`:
- `compareTo(Coord(1,1))` → 1 (greater) → append → `[Coord(1,1), Coord(1,3), Coord(1,2)]`
- Result is NOT sorted.

This affects `GoGroupData` which relies on `insert` to maintain sorted coord lists. Any code that depends on the sorted order (e.g., `getNeighborsEntryPoints` taking `coords[0]` as the "first" entry point) may pick the wrong representative coord.

**Recommendation:** Implement a proper binary-search insertion:
```typescript
public static insert(list: Coord[], coord: Coord): Coord[] {
    const result: Coord[] = [...list];
    const idx: number = result.findIndex((c: Coord) => c.compareTo(coord) > 0);
    if (idx === -1) result.push(coord);
    else result.splice(idx, 0, coord);
    return result;
}
```

---

### 2. `ofBoard` and `_getGroupDatas` crash on empty board

**Severity:** Low (same pattern as elsewhere)

```typescript
const groupIndices = TableUtils.create(board[0].length, board.length, -1); // crashes if board = []
```
```typescript
if (nextCoord.isInRange(board[0].length, board.length)) { // same crash
```

No guard for empty boards.

---

### 3. `_getGroupDatas` uses `===` for piece color comparison

**Severity:** Low (design assumption)

```typescript
if (color === groupDatas.color) {
```

Identity comparison (`===`) works for singleton pieces (enums, `FourStatePiece`). If a game used structurally-equal but non-singleton piece types, same-color cells would not be recognized as part of the group. Currently all usages are singleton-based, so this is safe but fragile.

---

### 4. `getGroupsDataWhere` uses an O(n²) membership check

**Severity:** Low (performance)

```typescript
if (groups.some((currentGroup: G) => currentGroup.selfContains(coord)) === false) {
```

`selfContains` iterates `getCoords()` linearly; `some` iterates all existing groups. For large boards this is O(cells × groups × group-size). The `ofBoard` method uses a flat `groupIndices` table for O(1) lookup; `getGroupsDataWhere` does not benefit from this optimization.

---

## No Other Issues Found

- `ofBoard` correctly assigns group indices and avoids visiting already-indexed cells.
- `GroupInfos` is a simple value type with no logic to verify.
