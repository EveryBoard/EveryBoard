# Review: `pipes-and-directives/elo.pipe.ts`

## Summary
Simple ELO formatting pipe. One localization concern.

---

## Findings

### 1. `'en-US'` locale is hardcoded — grouping uses commas for all users

**Severity:** Low

```typescript
new Intl.NumberFormat('en-US', { useGrouping: true }).format(value)
```

French users see `1,500` (en-US comma grouping) instead of the French `1 500` (thin-space grouping). The app supports at least `fr` and `en` locales. Using the user's current locale (from `LocaleUtils.getLocale()`) or `undefined` (which defaults to the browser's locale) would give locale-appropriate formatting.

---

## No Other Issues Found
