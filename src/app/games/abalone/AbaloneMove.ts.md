# Review: `games/abalone/AbaloneMove.ts`

## Summary
Move class for Abalone. One real decoder-validation issue and one informational API note found.

---

## Findings

### 1. `encoder` bypasses factory validation by calling the private constructor directly

**Severity:** Medium

```typescript
public static encoder: Encoder<AbaloneMove> = Encoder.tuple(
    [Coord.encoder, HexaDirection.encoder, MGPOptional.getEncoder(Coord.encoder)],
    (m: AbaloneMove): AbaloneMoveFields => [m.coord, m.dir, m.lastPiece],
    (fields: AbaloneMoveFields): AbaloneMove => new AbaloneMove(fields[0], fields[1], fields[2]));
```

`ofSingleCoord` asserts `coord.isInRange(9, 9)`, but decoder construction bypasses that factory and calls the private constructor directly. A deserialized move can therefore contain an out-of-range first coord, and `AbaloneRules.getFirstPieceValidity` will later call `state.getPieceAt(move.coord)` and assert instead of returning a validation failure.

The decoder should route through a fallible constructor or the constructor itself should enforce the same invariant as `ofSingleCoord`.

### 2. `ofDoubleCoord` silently degrades to `ofSingleCoord` when both coords move in the same direction

**Severity:** Informational

```typescript
if (hexaDirection.equals(dir)) {
    return AbaloneMove.ofSingleCoord(coords[1], dir);
} else if (hexaDirection.getOpposite().equals(dir)) {
    return AbaloneMove.ofSingleCoord(coords[0], dir);
}
```

When the two provided coords are aligned with the move direction, the method silently converts the "double coord" move into a single-coord move. This is intentional (inline push), but callers may be surprised that passing two coords doesn't always produce a two-coord move. The comment in `ofDoubleCoord` doesn't explain this behavior.

---

## No Other Issues Found

- `encoder` is correctly defined as a `tuple` encoder.
- `sortCoord` correctly ranks coords for deterministic ordering.
- `isTranslation` correctly identifies lateral (broadside) moves.
- `equals` correctly compares all three fields.
