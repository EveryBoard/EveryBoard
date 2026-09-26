# Review: `games/encapsule/EncapsuleMove.ts`

## Summary

Move encoding for Encapsule (drop or board move). One decoder-invariant issue found.

---

## Findings

### 1. `encoder` can decode invalid move shapes

**Severity:** Medium

```typescript
type EncapsuleMoveFields = [MGPOptional<Coord>, Coord, MGPOptional<EncapsulePiece>];
...
(fields: EncapsuleMoveFields): EncapsuleMove => new EncapsuleMove(fields[0], fields[1], fields[2])
```

A valid Encapsule move is either:

- a drop: `startingCoord` absent, `piece` present
- a board move: `startingCoord` present, `piece` absent

The decoder accepts all four optional combinations. If both optionals are absent, `isDropping()` returns true and `EncapsuleRules.isLegal` calls `move.piece.get()`, throwing. If both are present, the move is treated as a board move and the extra `piece` is silently ignored. The decoder also does not reject out-of-range `startingCoord` or `landingCoord`, leaving `state.getPieceAt(...)` to assert later.

The decoder should use a fallible constructor that enforces exactly one of `startingCoord` and `piece`, and the rules should still return validation failures for out-of-range coordinates.

---

## No Other Issues Found

- `equals` correctly delegates to `MGPOptional.equals` for both `startingCoord` and `piece`, covering drop vs. move disambiguation.
- `ofMove` guards start === end with `Utils.assert` (appropriate for internal callers).
