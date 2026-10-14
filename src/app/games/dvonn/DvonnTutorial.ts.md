# Review: `games/dvonn/DvonnTutorial.ts`

## Summary

Tutorial for Dvonn. One medium finding.

---

## Findings

### 1. `Utils.assert` in predicate will throw on legal moves not anticipated by the tutorial

**Severity:** Medium

In the "Disconnection" step (line 56–63), the predicate handles `move.getEnd() === (3,0)` explicitly, then asserts that all other moves must end at `(2,0)`:

```typescript
(move: DvonnMove, _previous: DvonnState, _result: DvonnState) => {
    if (move.getEnd().equals(new Coord(3, 0))) {
        return MGPValidation.failure(...);
    } else {
        Utils.assert(move.getEnd().equals(new Coord(2, 0)), 'player made an impossible move');
        return MGPValidation.SUCCESS;
    }
},
```

The comment says `// this is the only valid move remaining`, but the board state has:

```
Row 0: [NN, NN, X1, SO, ...]
Row 1: [NN, __, O1, ...]
Row 2: [__, __, X4, ...]
```

Dark's only piece is `O1` at `(2,1)` (size 1). Its hex neighbours that are occupied include:
- `(2,0)` — `X1` (handled)
- `(3,0)` — `SO` (handled)
- `(2,2)` — `X4` (NOT handled)

Moving `O1` onto `X4` at `(2,2)` is a legal Dvonn move (landing on an occupied space). When the player does this, the `Utils.assert` on line 60 fires, crashing the tutorial with an unhandled assertion rather than showing a graceful failure message.

**Fix:** Replace the `Utils.assert` with a catch-all `MGPValidation.failure(...)`:

```typescript
} else if (move.getEnd().equals(new Coord(2, 0))) {
    return MGPValidation.SUCCESS;
} else {
    return MGPValidation.failure($localize`That move does not disconnect the opponent's stack. Try again.`);
}
```

---

## No Other Issues Found

- Board states are well-formed; UNREACHABLE cells use the `NN` alias correctly.
- The "Passing" informational step uses a state where dark genuinely has no legal moves (both `O2` and `O4` have no occupied landing cells at the required distances).
- `DvonnMove.from(...).get()` calls in `fromMove` steps are safe for the given states.
