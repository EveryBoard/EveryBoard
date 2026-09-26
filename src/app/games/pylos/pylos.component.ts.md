# Review: `games/pylos/pylos.component.ts`

## Summary

Component for Pylos. Two medium UI bugs found.

---

## Findings

### 1. `validateCapture` is a no-op when no captures are selected

**Severity:** Medium

```typescript
if (this.chosenFirstCapture.isAbsent() && this.chosenSecondCapture.isAbsent()) {
    return MGPValidation.SUCCESS;  // no move submitted!
}
```

When `canCapture` returns `true`, the UI waits for the user to select captures and click validate. If the user clicks validate without selecting any captures (intending to skip the optional capture), `validateCapture` returns `MGPValidation.SUCCESS` without calling `concludeMoveWithCapture([])`. No move is submitted — the component remains stuck in the post-drop capture-selection state indefinitely (until the user cancels). Fix: replace with `return this.concludeMoveWithCapture([])`.

---

### 2. Changing starting piece mid-climb corrupts `constructedState`

**Severity:** Medium

```typescript
private async onClimbClick(clickedCoord: PylosCoord): Promise<MGPValidation> {
    this.chosenStartingCoord = MGPOptional.of(clickedCoord);
    this.constructedState = this.constructedState.removePieceAt(clickedCoord); // always removes
    return MGPValidation.SUCCESS;
}
```

If the user clicks piece A (its removal is applied to `constructedState`), then clicks piece B without canceling, `onClimbClick` is called again, setting `chosenStartingCoord = B` and removing B from `constructedState` too. Both A and B are now missing from `constructedState` even though only B is the intended starting piece. Subsequent `isLandable` checks and `onDrop` will see a corrupted board. Fix: restore the previously chosen starting coord before applying the new one, or cancel the previous choice first.

---

## Notes

- `constructedState` is declared without initializer — it's `undefined` until `updateBoard` runs. In Angular, `updateBoard` is called before user interaction so this is low risk, but explicitly initializing to `this.state` in the constructor would be cleaner.
- `highCapture` is set in `showLastMove` when the first capture `mustDrawCoord` returns false, but `secondCapture` is never checked the same way — could miss high second captures cosmetically.
- `getCaptureValidationButtonClasses` returns `'semi-transparent'` when no captures selected, but the button remains clickable (the no-op bug above).

## No Other Issues Found

- `onPieceClick` uses `this.constructedState` for `isSupporting` during capture phase (correct, reflects post-drop board state). ✓
- `cancelMoveAttempt` fully resets `constructedState = this.state` and clears all chosen coords. ✓
- `updateBoard` correctly computes `remainingPieces = 15 - repartition`. ✓
