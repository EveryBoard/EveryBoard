# Review: `games/abalone/AbaloneMoveGenerator.ts`

## Summary
Move generator for Abalone AI. Two issues found.

---

## Findings

### 1. `isAcceptablePush` filters moves where the opponent gains score, but the comment is inverted

**Severity:** Informational

```typescript
if (scores.get(opponent) < newScores.get(opponent)) {
    return false; // some player just push themself
}
```

The comment says "some player just pushed themselves" but the condition checks if the opponent's score increased after a push — meaning the current player's piece was pushed off. The comment should say "the current player just pushed their own piece off the board" or similar. The logic is correct but the comment is misleading.

---

### 2. `continue` inside the outer `else` branch is unreachable

**Severity:** Cosmetic

```typescript
if (this.isAcceptablePush(move, state, config)) {
    moves.push(move);
} else {
    continue;  // This continue in the else branch
}
for (const alignment of HexaDirection.factory.all) { ... }
```

The `continue` inside the `else` branch correctly skips the inner loop when the push is unacceptable, but this is equivalent to `continue` in the outer `for (const dir of ...)` loop. The code is correct but `break` from a conditional before the inner loop would be equally clear.

---

## No Other Issues Found

- Deduplication via `new Set(moves).toList()` is correct.
- Breaking out of the `distance` loop when off-board is correct.
- Correctly skips non-player pieces at the start.
