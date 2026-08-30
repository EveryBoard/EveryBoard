# Review: `games/yinsh/YinshMove.ts`

## Summary
Yinsh move and capture representation. One downstream validation risk noted.

---

## Findings

### 1. Captures can be decoded without a selected ring

**Severity:** Medium

`YinshCapture.encoder` explicitly allows `ringTaken` to be `MGPOptional.empty()`. That is useful while a capture is being selected in the component, but a complete `YinshMove` can also be decoded with captures whose ring is absent.

`YinshRules.captureValidity()` later calls `capture.ringTaken.get()` without checking presence first, which turns such a move into an exception rather than a normal legality failure.

**Recommendation:** Keep the representation flexible, but make `YinshRules.captureValidity()` reject absent `ringTaken` with `YinshFailure.CAPTURE_SHOULD_TAKE_RING()`.

---

## No Other Issues Found

- `YinshCapture` enforces exactly five consecutive aligned markers.
- Equality compares start/end and both capture lists.
- Initial placement is represented by an absent `end`, matching the rules.
