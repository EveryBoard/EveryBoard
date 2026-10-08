# Review: `jscaip/RulesConfigUtil.ts`

## Summary
Minimal utility. One unsafe cast; one circular-dependency concern.

---

## Findings

### 1. `getGameDefaultConfig` uses an unchecked `as C` cast

**Severity:** Low

```typescript
return gameInfo.get().getRulesConfig() as C;
```

`getRulesConfig()` returns `RulesConfig` (the base type). The cast to `C` is not verified — if the caller specifies a `C` that does not match what the game actually returns, TypeScript accepts it but the runtime object may be missing fields expected by `C`. Callers should verify the returned config shape or this method should remain for internal use only.

---

### 2. Import of `GameInfo` from a component file

**Severity:** Low (architecture)

`RulesConfigUtil` is in `jscaip/` (core framework layer) but imports `GameInfo` from `components/normal-component/pick-game/pick-game.component`. This creates a dependency from the game-engine layer into the UI component layer, which is an inversion of the expected dependency direction. If `pick-game.component` is ever refactored or moved, this import breaks.

**Recommendation:** Move `GameInfo` to a shared domain/registry module, or move `getGameDefaultConfig` to the component layer.

---

## No Other Issues Found

- `RulesConfig`, `EmptyRulesConfig`, `NamedRulesConfig`, `DefaultConfigDescription` are well-typed.
