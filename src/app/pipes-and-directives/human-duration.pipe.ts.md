# Review: `pipes-and-directives/human-duration.pipe.ts`

## Summary
Correct duration formatter with proper singular/plural handling. No bugs found.

---

## Findings

### 1. Negative durations produce undefined output

**Severity:** Informational

If `duration < 0`, `%` in JavaScript can return negative values. The hours/minutes/seconds decomposition would produce negative components, leading to output like "-1 seconds". In practice durations are always non-negative, so this is a theoretical edge case.

---

## No Other Issues Found

- Hours, minutes, and seconds arithmetic is correct (verified with several examples).
- Singular/plural cases ("1 second" vs "2 seconds") are correctly handled.
- The `$localize` pattern for "X and Y" correctly allows translators to reorder components.
- `0 seconds` fallback for zero duration is correct.
