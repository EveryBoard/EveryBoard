# Review: `jscaip/state/GameStateWithTable.ts`

## Summary
Solid, well-structured base class. One latent crash, one type-safety gap, and a few minor inefficiencies.

---

## Findings

### 1. `getWidth()` crashes on empty board

**Severity:** Low (never triggered in practice, but a hidden invariant)

```typescript
public getWidth(): number {
    return this.board[0].length; // TypeError if board is []
}
```

If a concrete state is constructed with an empty `board` array, this throws `TypeError: Cannot read properties of undefined`. The constraint "board must have at least one row" is not enforced by the type `Table<P>` (`ReadonlyArray<ReadonlyArray<P>>`).

**Recommendation:** Either add `Utils.assert(this.board.length > 0, ...)` in the constructor, or guard here: `return this.board.length === 0 ? 0 : this.board[0].length`.

---

### 2. Generic `P` is unconstrained but `comparableEquals` requires `ComparableValue`

**Severity:** Medium (type safety gap)

```typescript
export abstract class GameStateWithTable<P extends NonNullable<unknown>> extends GameState {
```

Multiple methods — `hasPieceAt`, `hasInequalPieceAt`, `countPieceInRow`, `countPieceOnBoard`, and `toPieceMap` — pass values of type `P` to `comparableEquals`, which throws at runtime if its argument is not a `ComparableValue` (JSON primitive, `ComparableObject`, or `null`).

TypeScript does not catch this because the constraint is too loose. Any subclass using a non-comparable piece type (e.g., a plain `object` or class without `equals()`) would silently compile but throw at runtime.

**Recommendation:** Add `ComparableObject` (or a union type) to the `P` constraint, or at minimum document the requirement.

---

### 3. `countPieceInRow` has no bounds check on `row`

**Severity:** Low

```typescript
public countPieceInRow(piece: P, row: number): number {
    let result: number = 0;
    for (let x: number = 0; x < this.getWidth(); x++) {
        if (comparableEquals(this.board[row][x], piece)) {
```

If `row < 0` or `row >= this.getHeight()`, `this.board[row]` is `undefined` and the loop throws immediately. All other coordinate-based methods guard via `isOnBoard`. This method is inconsistent.

**Recommendation:** Add `Utils.assert(row >= 0 && row < this.getHeight(), 'row out of bounds: ' + row)`.

---

### 4. `getCoordsAndContents()` performs redundant bounds checks

**Severity:** Cosmetic / minor performance

The loop already iterates within `[0, width) × [0, height)`, so the `isOnBoard(coord)` call (which checks the same range) is always true for rectangular boards. The comment acknowledges this is for subclass override. However, inside the `if` block, `getPieceAt(coord)` is called, which itself calls `isOnBoard` again. Each coord thus triggers 2 bounds checks.

**Recommendation:** Call `getUnsafe(coord)` instead of `getPieceAt(coord)` inside `getCoordsAndContents` to eliminate the second redundant check.

---

### 5. `[Symbol.iterator]` materialises a full copy before returning

**Severity:** Cosmetic / minor performance

```typescript
public [Symbol.iterator](): IterableIterator<P> {
    const linedUpElements: P[] = [];
    for (const lines of this.board) {
        linedUpElements.push(...lines);
    }
    return linedUpElements.values();
}
```

This allocates an intermediate array the size of the entire board before producing the first element. A generator would avoid the allocation:

```typescript
public *[Symbol.iterator](): IterableIterator<P> {
    for (const line of this.board) {
        yield* line;
    }
}
```

---

## No Other Issues Found

- `toPieceMap()` correctly uses `map.set` for new keys (which throws if duplicate) and `map.put` for existing keys (which overwrites) — the if/else ensures these are never swapped.
- `setPieceAt` static helper is correctly generic and delegates turn management to the `stateAdapter`.
- `getOptionalPieceAt` / `getOptionalPieceAtXY` are safe (check `isOnBoard` before access).
