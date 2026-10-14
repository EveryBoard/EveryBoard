# Review: `games/gos/GoMove.ts`

## Summary

Move class for Go variants. One informational finding.

---

## Findings

### 1. `PASS` and `ACCEPT` sentinels are not round-trip safe through the encoder

**Severity:** Informational

```typescript
public static readonly PASS: GoMove = new GoMove(-1, 0);
public static encoder: Encoder<GoMove> = MoveCoord.getEncoder(GoMove.of);
```

`MoveCoord.getEncoder` decodes moves via `GoMove.of(coord)` which calls `new GoMove(coord.x, coord.y)`. A deserialized PASS move produces a new instance with `(x=-1, y=0)`, not the `GoMove.PASS` singleton. Any code using identity checks (`move === GoMove.PASS`) will fail for deserialized moves. `toString()` on line 18 uses identity and would return the generic string form for deserialized PASS/ACCEPT.

If the game rules only use `.equals()` for comparison (which compares coordinates), this is benign — but it is fragile. A custom encoder that returns the singletons for the special coordinates would be safer.

---

## No Other Issues Found

- Sentinel coordinates (-1, 0) and (-2, 0) are safely outside any valid board range.
