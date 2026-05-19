# Review: `games/dvonn/DvonnMove.ts`

## Summary
Move type for Dvonn (straight-line on hexagonal board, plus PASS). Two issues found.

---

## Findings

### 1. Error message for out-of-range end coord references `start` instead of `end`

**Severity:** Medium

```typescript
if (DvonnState.isNotOnBoard(end)) {
    return MGPFallible.failure('End coord of DvonnMove must be on the board, not at ' + start.toString());
}
```

The error message says "not at " + `start.toString()`, but should say "not at " + `end.toString()`. The wrong coord is shown in the error, making debugging harder.

---

### 2. Comments for horizontal and vertical checks are swapped

**Severity:** Cosmetic

```typescript
if (start.y === end.y) {
    // vertical move, allowed
} else if (start.x === end.x) {
    // horizontal move, allowed
}
```

`start.y === end.y` means the row is fixed — this is a horizontal move. `start.x === end.x` means the column is fixed — this is a vertical move. The comments are reversed.

---

## No Other Issues Found

- PASS move sentinel coordinates (-1,-1) and (-2,-2) are correctly detected and roundtripped.
- `getDistance()` returns correct values for all three move directions.
