# Review: `games/checkers/common/AbstractCheckersRules.ts`

## Summary
Abstract checkers rules implementation with configurable variants. Two issues found.

---

## Findings

### 1. `getPieceCaptures` uses `moved` (same reference as `piece`) for capture stacking

**Severity:** Informational

```typescript
const moved: CheckersStack = state.getPieceAt(coord);
...
movingStack = movingStack.capturePiece(capturedCommander);
```

Wait — `moved` is only used as the piece placed on the `fakePostCaptureState`, while `movingStack` (not shown here but in `applyLegalMove`) handles actual capture. In `getPieceCaptures`, `moved` is set to the full stack at `coord` and placed on `landing` in `fakePostCaptureState`. Since `capturePiece` isn't called on `moved` here, the fake state doesn't reflect captured pieces accumulating. However, this is only used for detecting further capture opportunities (not for final state), so the missing captured-piece accumulation doesn't affect legality detection. Informational only.

---

### 2. `getDirectionValidity` allows frisian captures of size 4 only, but error message says "at least steps of 4"

**Severity:** Informational

```typescript
} else if (frisianSize === 2) {
    return MGPValidation.failure(CheckersFailure.INVALID_FRISIAN_MOVE());
}
```

The Frisian capture must be of even size (checked) and not of size 2 (too short). Size 4 and larger are allowed. However, `getFlyLegality` only allows `distance === 4` for frisian captures:

```typescript
if (distance === 4 && config.frisianCaptureAllowed) {
    return MGPValidation.SUCCESS;
}
```

This means size 6 frisian captures pass `getDirectionValidity` but then fail `getFlyLegality`. There may be an inconsistency between what `getDirectionValidity` allows (≥4, even) and what `getFlyLegality` actually permits (only exactly 4).

---

## No Other Issues Found

- `applyLegalMove` correctly handles both step and capture moves, including promotion.
- `getGameStatus` correctly gives victory to the opponent when no moves are available.
- `isLegalCaptureChoice` correctly enforces maximal capture when configured.
- `getFlyiedOverPlayers` correctly returns only occupied stacks between start and end.
