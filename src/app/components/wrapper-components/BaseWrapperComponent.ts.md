# Review: `components/wrapper-components/BaseWrapperComponent.ts`

## Summary
Base class for all game wrapper components. One issue found.

---

## Findings

### 1. `getGameUrlName` throws if route param `game` is absent

**Severity:** Medium

```typescript
protected getGameUrlName(): string {
    return Utils.getNonNullable(this.activatedRoute.snapshot.paramMap.get('game'));
}
```

`Utils.getNonNullable` throws if `paramMap.get('game')` returns `null`. Routes that don't have a `:game` segment (or badly configured routes) would cause an assertion failure here. The `DemoCardWrapperComponent` overrides this method, but any other subclass that isn't routed correctly would fail silently with an assertion error.

---

## No Other Issues Found

- `getRulesConfigDescription` correctly asserts game existence before accessing it.
- `getStateProvider` safely returns `MGPOptional.empty()` for unknown games via `GameInfo.getStateProvider`.
