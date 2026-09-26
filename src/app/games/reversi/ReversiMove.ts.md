# Review: `games/reversi/ReversiMove.ts`

## Summary

Move type for Reversi. One issue found: arbitrary decoded coordinates are accepted apart from the special pass sentinel.

---

## Findings

### 1. Encoder/factory accept malformed non-pass coordinates

**Severity:** Medium

```typescript
public static readonly PASS: ReversiMove = new ReversiMove(-1, -1);

public static of(coord: Coord): ReversiMove {
    return new ReversiMove(coord.x, coord.y);
}
```

`ReversiMove` needs one out-of-board sentinel for pass, but `of` accepts any coordinate. `ReversiRules.isLegal` only treats `(-1, -1)` as pass; any other out-of-board coordinate continues to `state.getPieceAt(move.coord)`, which can assert or index outside the board before returning a validation failure.
