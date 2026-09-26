# Review: `main.ts`

## Summary
Application bootstrap and runtime translation loading. One robustness issue found.

---

## Findings

### 1. Translation fetch failure prevents app bootstrap

**Severity:** Low

When `runtimeTranslations` is enabled and the locale is not `en`, the app waits for `fetch(environment.root + 'assets/' + locale + '.json')` before calling `bootstrapApp()`. HTTP errors fall back to English translations, but network or parsing failures only log the error in `.catch()` and never call `bootstrapApp()`.

This means a transient asset/network failure for a non-English locale can leave the page blank instead of booting with default strings.

**Recommendation:** Call `bootstrapApp()` in the catch path, optionally after logging the translation loading failure.

---

## No Other Issues Found

- Firebase initialization happens before Angular bootstrap.
- Locale provider uses the same `LocaleUtils.getLocale()` value used for runtime translations.
- Production mode is gated by `environment.production`.
