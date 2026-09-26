# Review: `games/conspirateurs/conspirateurs.component.ts`

## Summary
Conspirateurs UI component with drop, step, and multi-hop jump interaction. Two informational findings.

---

## Findings

### 1. `selectNextCoord` does not validate board legality of the first jump segment

**Severity:** Informational

```typescript
const jump: MGPFallible<ConspirateursMoveJump> = ConspirateursMoveJump.from([selected, coord]);
if (jump.isFailure()) {
    return this.cancelMove(jump.getReason());
}
return this.updateJump(jump.get());
```

`ConspirateursMoveJump.from` only validates geometry (distance 2, aligned). If the cell jumped over is empty, the jump is geometrically valid but board-illegal. `updateJump` then stores this jump in `jumpInConstruction` and displays it as in-progress. The error is only caught later when `chooseMove` calls `isLegal`. A legality check (checking the jumped-over cell is occupied) before storing the jump would give immediate feedback.

---

### 2. `SquareInfo.isOccupiedShelter` is never set to `true`

**Severity:** Informational

`isOccupiedShelter` is declared in the `SquareInfo` interface and initialized to `false` in `updateViewInfo`, but no code path ever sets it to `true`. The shelter highlight logic in `updateShelterHighlights` uses `shelterClasses` and `victory-fill` instead. If the HTML template doesn't reference `isOccupiedShelter`, this field is dead.

---

## No Other Issues Found

- `jumpInConstruction.get()` and `selected.get()` are both guarded by `isPresent()` checks.
- Multi-hop jump finalization via double-click is correctly implemented in `constructJump`.
