# Review: `games/gos/AbstractGoRules.ts`

## Summary

Abstract rules for Go variants. One missing validation bug found, plus two informational findings.

---

## Findings

### 1. `isLegal` indexes the board for malformed non-pass, non-accept moves without a bounds check

**Severity:** Medium

```typescript
} else if (this.isOccupied(move.coord, state.getCopiedBoard())) {
    ...
}
```

`GoMove` uses coordinates for special moves: `PASS = (-1, 0)` and `ACCEPT = (-2, 0)`. Those exact coordinates are handled first, but any other out-of-range coordinate reaches `isOccupied`, which does `board[coord.y][coord.x].isOccupied()` without checking that `coord` is inside the board. A malformed replay/network move such as `(-3, 0)` or `(width, 0)` can therefore throw a runtime exception instead of returning a validation failure.

The shared Go rules should reject non-special moves whose coord is not on board before calling `isOccupied` or `isLegalTranslation`.

### 2. `CANNOT_PASS_AFTER_PASSED_PHASE` message advises "accepting by passing" but passing is illegal in counting phase

**Severity:** Informational

```typescript
return MGPFallible.failure(GoFailure.CANNOT_PASS_AFTER_PASSED_PHASE());
```

The failure message says "you must… accept the current board **by passing your turn**", but in counting/accept phases the legal move is `GoMove.ACCEPT`, not `GoMove.PASS`. The message misleads the user about what action to take. Additionally, `GoPhase.allowsPass()` returns `true` for all phases except FINISHED (suggesting the "pass button" is shown), but `isLegal` rejects `GoMove.PASS` in counting and accept phases — the UI pass button must generate `GoMove.ACCEPT` in those phases for correctness.

---

### 3. `getCaptureState` dedup uses only the first captured coord — fragile for groups with non-deterministic coord ordering

**Severity:** Informational

```typescript
if (capturedInDirection.length > 0 &&
    captureState.capturedCoords.every((coord: Coord) => capturedInDirection[0].equals(coord) === false))
```

The dedup check only compares `capturedInDirection[0]` against the already-accumulated list. If the same capturable group is reachable from two adjacent directions and `getCoords()` returns the group members in different orders for the two traversal entry points, the dedup fails and the same group's coords are added twice, doubling the capture count. In practice this is likely safe (groups with exactly 0 liberties after placement are the last-liberty group, and `getCoords()` is deterministic for a given entry point), but the logic is fragile.

---

## No Other Issues Found

- `isPass` and `isAccept` use `.equals()` (coordinate comparison), correctly handling deserialized moves.
- `switchAliveness` `±2 * group.*Coords.length` adjustment is intentional for a counting system where dead stones count as 2 points (1 captured + 1 territory).
- `resurrectStones` correctly processes all dead pieces before removing territory marks, avoiding interference between the two operations.
- `getGameStatus` correctly returns DRAW when captures are equal (Go can draw in some counting systems).
