# Review: `games/teeko/TeekoMove.ts`

## Summary

Move encoding for Teeko. One issue found: a disjunction type predicate is wrong.

---

## Findings

### 1. Translation predicate is declared as `TeekoDropMove`

**Severity:** Low

```typescript
export const encoder: Encoder<TeekoMove> =
    Encoder.disjunction(
        [
            (move: TeekoMove): move is TeekoDropMove => move instanceof TeekoDropMove,
            (move: TeekoMove): move is TeekoDropMove => move instanceof TeekoTranslationMove,
        ],
        [
            TeekoDropMove.encoder,
            TeekoTranslationMove.encoder,
        ]);
```

The second predicate correctly checks `move instanceof TeekoTranslationMove`, but its TypeScript type predicate says `move is TeekoDropMove`. Runtime encoding still dispatches to `TeekoTranslationMove.encoder` because the boolean check is correct, so this is mainly a type-safety/documentation bug. It should be `move is TeekoTranslationMove`.
