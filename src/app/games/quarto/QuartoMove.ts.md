# Review: `games/quarto/QuartoMove.ts`

## Summary

Move class for Quarto. One issue found: decoded/public moves are not range-checked.

---

## Findings

### 1. Constructor and encoder accept out-of-board coordinates

**Severity:** Medium

```typescript
(fields: [Coord, QuartoPiece]): QuartoMove => new QuartoMove(fields[0].x, fields[0].y, fields[1])
```

`QuartoMove` is a fixed-board move type, but neither its public constructor nor its encoder validates that the coordinate is inside the 4x4 board. `QuartoRules.isLegal` indexes `state.board[y][x]` through `state.getPieceAt(move.coord)`, so a malformed replay/network move can throw before returning a normal validation failure.
