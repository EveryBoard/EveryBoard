# Review: `utils/LocaleUtils.ts`

## Summary
Clean locale utility. One minor hard-coding note.

---

## Findings

### 1. `validLocales` and `defaultLocale` are hard-coded constants

**Severity:** Informational

```typescript
const defaultLocale: string = 'fr';
const validLocales: string[] = ['en', 'fr'];
```

Adding a new language requires updating this file. These could be derived from Angular's build configuration (`$localize` locale IDs) or extracted to a shared constant. Currently, if a new locale is added to Angular's build but not here, it will never be selected.

---

## No Other Issues Found

- `slice(0, 2).toLowerCase()` correctly normalizes `en-US` to `en`.
- Priority order (stored > navigator > default) is correct.
- `getNavigatorLanguage` and `getStoredLocale` as separate methods allows spying in tests.
