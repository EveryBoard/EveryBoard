# Review: `games/apagos/ApagosMove.ts`

## Summary
Move class for Apagos (drop or slide-down). One missing issue found: the decoder can create malformed move shapes that rules code does not reject safely.

---

## Findings

### 1. Encoder permits invalid drop/transfer field combinations

**Severity:** Medium

`ApagosMove` represents both move kinds with `piece: MGPOptional<Player>` and `starting: MGPOptional<number>`, but the decoder calls the private constructor directly:

```typescript
(fields: ApagosMoveFields): ApagosMove => new ApagosMove(fields[0], fields[1], fields[2])
```

A valid drop should have `piece` present and `starting` absent; a valid transfer should have `piece` absent and `starting` present with `start > landing`. The decoder also accepts both optionals absent, both present, or non-downward transfers. `isDrop()` only checks `piece.isPresent()`, so both-present moves are treated as drops and ignore `starting`; both-absent moves reach `isLegalSlideDown` and call `move.starting.get()`.

`ApagosRules.isLegal` also calls `state.getPieceAt(move.landing)` before any bounds check, so malformed decoded moves can throw or read invalid board cells instead of producing a validation failure.

---

## Notes

- `transfer` correctly validates downward direction before constructing the move.
- `equals` correctly checks all fields.
