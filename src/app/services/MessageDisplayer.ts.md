# Review: `services/MessageDisplayer.ts`

## Summary
Simple toast wrapper. One inaccuracy in the reading-speed calculation.

---

## Findings

### 1. Word count splits on single space only — underestimates multi-space or punctuation-heavy messages

**Severity:** Cosmetic

```typescript
const words: number = message.split(' ').length;
```

`split(' ')` splits on a single space. Multiple consecutive spaces or newlines produce empty strings counted as words, slightly overestimating word count. For typical toast messages this has no practical impact.

---

## No Other Issues Found

- The `toast` method is split from `message` to allow `spyOn` in tests — correct design.
- The minimum 3-second floor is reasonable for short messages.
- Reading speed at 150 wpm (below-average) gives comfortable reading time for non-native speakers.
