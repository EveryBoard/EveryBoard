# Review: `games/six/SixMove.ts`

## Summary

Move type for Six. One missing issue found: decoded drop moves can carry an ignored `keep` coordinate.

---

## Findings

### 1. Drop moves with `keep` present are accepted during the drop phase

**Severity:** Low

`SixMove` encodes `[start, landing, keep]`, but the private decoder factory only calls the constructor:

```typescript
private static of(start: MGPOptional<Coord>, landing: Coord, keep: MGPOptional<Coord>): SixMove {
    return new SixMove(start, landing, keep);
}
```

The constructor rejects static translations and `start === keep`, but it does not reject `start` absent with `keep` present. Such a decoded move still returns `true` from `isDrop()`. In the drop phase, `SixRules.isLegalDrop` only checks `move.isDrop() === false`, so the move is accepted and `applyLegalDrop` ignores `keep`.

This is not a normal UI path because `ofDrop` always leaves `keep` absent, but replay/network decoding can represent a semantically invalid drop.

---

## No Other Issues Found

- Three move types: `ofDrop` (place new piece), `ofTranslation` (move piece), `ofCut` (move piece + keep a connected component). ✓
- Constructor assertions: non-static translation, and start ≠ keep. ✓
- `equals`: landing, then start, then keep. ✓
- `encoder`: tuple of optional-start, landing, optional-keep. ✓
