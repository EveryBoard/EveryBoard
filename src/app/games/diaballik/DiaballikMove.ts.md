# Review: `games/diaballik/DiaballikMove.ts`

## Summary
Move type for Diaballik (up to 3 sub-moves: at most 2 translations and 1 pass). One cosmetic finding.

---

## Findings

### 1. Decoder parameter typed as `MoveCoordToCoord` instead of `DiaballikSubMove`

**Severity:** Cosmetic

```typescript
(fields: [MoveCoordToCoord, MGPOptional<MoveCoordToCoord>, MGPOptional<MoveCoordToCoord>]) => {
    return new DiaballikMove(fields[0], fields[1], fields[2]);
}
```

The decoder annotates field types as `MoveCoordToCoord` rather than `DiaballikSubMove`. The constructor expects `DiaballikSubMove`, which is the union `DiaballikBallPass | DiaballikTranslation`. At runtime the decoded values are the correct subclasses, so this works, but the type annotation is imprecise and may require a cast or suppress a TypeScript error.

---

## No Other Issues Found

- Constructor correctly asserts at most one pass and at most two translations.
- `getSubMoves` correctly flattens the optional second and third sub-moves.
