# Review: `games/yinsh/YinshRules.ts`

## Summary
Yinsh rules implementation. One validation bug found.

---

## Findings

### 1. Capture validation can throw when `ringTaken` is absent

**Severity:** Medium

```typescript
if (state.getPieceAt(capture.ringTaken.get()) !== YinshPiece.RINGS.get(player)) {
    return MGPValidation.failure(YinshFailure.CAPTURE_SHOULD_TAKE_RING());
}
```

`YinshCapture` permits `ringTaken` to be absent, and the move encoder can decode that shape. If a complete move contains a capture without a ring, `isLegal()` reaches `captureValidity()` and `.get()` throws instead of returning a validation failure.

This can crash the frontend on malformed or stale remote game data instead of displaying a normal illegal-move reason.

**Recommendation:** Add an explicit presence check before reading the coordinate:

```typescript
if (capture.ringTaken.isAbsent()) {
    return MGPValidation.failure(YinshFailure.CAPTURE_SHOULD_TAKE_RING());
}
```

---

## No Other Issues Found

- Initial placement decrements the current player's side rings and delays turn increment through `applyLegalMove`.
- Ring movement enforces straight-line movement, empty landing, no ring jumping, and first-empty-after-marker-group.
- Mandatory initial and final captures are enforced through `noMoreCapturesValidity`.
- Game status checks for three captured rings after the placement phase.
