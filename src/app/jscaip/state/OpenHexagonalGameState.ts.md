# Review: `jscaip/state/OpenHexagonalGameState.ts`

## Summary
Clean design. Three findings: one crash on empty pieces map, one stale `width`/`height` after mutation, and a minor concern in `getGroups`.

---

## Findings

### 1. `computeScale()` crashes when `pieces` is empty

**Severity:** Medium

```typescript
public computeScale(): Scale {
    let minWidth: number = Number.POSITIVE_INFINITY;
    let maxWidth: number = Number.NEGATIVE_INFINITY;
    ...
    return {
        width: maxWidth + 1 - minWidth,   // NaN when no pieces: -Infinity + 1 - +Infinity
        height: maxHeight + 1 - minHeight,
    };
}
```

If `pieces` is an empty `ReversibleMap`, the loop body never executes, leaving all four variables at their initial infinity values. The resulting `width` and `height` are `NaN` (`Number.NEGATIVE_INFINITY + 1 - Number.POSITIVE_INFINITY`). These `NaN` values are then stored in `this.width` and `this.height`, silently corrupting all subsequent calls to `isOnBoard`, `getOccupiedNeighbors`, etc.

The constructor does not guard against this. Constructing an empty `OpenHexagonalGameState` is therefore a latent source of undefined behavior.

**Recommendation:** Add `Utils.assert(this.pieces.size() > 0, 'OpenHexagonalGameState must have at least one piece')` in the constructor, or handle the empty case explicitly in `computeScale()`.

---

### 2. `width` and `height` become stale if `pieces` is mutated before `makeImmutable`

**Severity:** Low (unlikely in practice)

`computeScale()` is called in the constructor, and the result is stored in `this.width`/`this.height`. The call to `this.pieces.makeImmutable()` happens *after* `computeScale()`. Between construction and the `makeImmutable()` call, if a subclass constructor mutates `pieces`, the stored dimensions would be stale.

Since the constructor is the only place `pieces` could change before immutability is enforced, this is unlikely in practice, but the ordering is fragile.

**Recommendation:** Call `this.pieces.makeImmutable()` before `computeScale()`.

---

### 3. `getGroups()` may be slow for large open boards

**Severity:** Low (performance)

The BFS in `getGroups` uses `CoordSet` (likely backed by a sorted array or similar) for `visited`, `group`, and `toVisit`. For boards with many pieces, each `contains`, `addElement`, and `removeElement` may be O(n) if `CoordSet` is a linear structure. For typical game boards this is acceptable, but for large open hexagonal boards (e.g., Hive with many pieces), this could be a bottleneck.

---

### 4. `pieces` field is `public` and non-readonly

**Severity:** Low (encapsulation)

```typescript
public constructor(public pieces: ReversibleMap<Coord, T>, turn: number) {
```

`pieces` is a public mutable field. After `makeImmutable()` is called (which prevents mutation of the map's internal state), the `pieces` reference itself could still be replaced from outside: `state.pieces = someOtherMap`. This breaks the immutability invariant of game states.

**Recommendation:** Change to `public readonly pieces`.

---

## No Other Issues Found

- `isOnBoard` correctly delegates to `pieces.containsKey`.
- `getOccupiedNeighbors` correctly filters to only on-board neighbors.
- `getGroups` correctly implements BFS connected-component labeling.
