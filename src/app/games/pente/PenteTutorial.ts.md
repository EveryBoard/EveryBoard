# Review: `games/pente/PenteTutorial.ts`

## Summary

Tutorial for Pente. One medium finding: wrong player label in a step description.

---

## Findings

### 1. "Placing in a sandwich position" step says "You're playing Light" but Dark moves

**Severity:** Medium (misleading tutorial)

```typescript
new PenteState([...], PlayerNumberMap.of(0, 0), 4),  // turn=4 → ZERO (Dark) plays
// description: "You're playing Light and have the opportunity to do such a move here, do it!"
```

`turn=4` is even → ZERO (Dark) plays. The description says "You're playing Light." The `fromMove` expected move `PenteMove.of(new Coord(9, 7))` is correctly a Dark placement (ZERO places at (9,7)), but the label "Light" is wrong. Fix: change description to "You're playing Dark."

---

## No Other Issues Found

- "Captures" step: turn=3 (ONE=Light plays), placing X at (9,6) sandwiches O at (9,7)-(9,8) from above with X at (9,9) below → capture of 2 pieces. ✓
- "Placing in a sandwich" logic: ZERO at (9,7) creates pattern X(9,6)-O(9,7)-O(9,8)-X(9,9); both closing X pieces are already placed so ONE cannot trigger a capture — correctly described as "safe." ✓
- "Victory" step: turn=7 (ONE=Light plays), starting captures=8 each.
  - (9,6): X sandwiches O at (9,7)-(9,8) with X at (9,9) → 2 captures → 8+2=10 → win by captures. ✓
  - (8,9): creates 5-in-a-row for X at x=8,9,10,11,12 in row 9. ✓
  - (13,9): creates 5-in-a-row for X at x=9,10,11,12,13 in row 9. ✓
