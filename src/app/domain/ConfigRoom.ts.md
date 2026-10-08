# Review: `domain/ConfigRoom.ts`

## Summary
Clean type definitions with namespace-based constants. One minor note.

---

## Findings

### 1. `eslint-disable @typescript-eslint/no-redeclare` comments — intentional but non-obvious

**Severity:** Informational

The pattern of declaring a type and a same-named namespace (e.g., `FirstPlayer` type + `FirstPlayer` namespace) requires suppressing `no-redeclare`. This is a well-known TypeScript pattern for "enum-like" string unions with named constants. The disables are intentional.

---

## No Other Issues Found

- `ConfigProposal` as `Pick<ConfigRoom, ConfigProposalFields>` is a correct and safe subset type.
- Duration constants in `GameDuration` are in seconds (not milliseconds) — the naming is clear.
- All fields in `ConfigRoom` are `readonly` — good immutability.
