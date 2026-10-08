# Review: `services/ThemeService.ts`

## Summary
Clean theme management service. One uninitialized field risk and one minor DOM note.

---

## Findings

### 1. `theme` field may be uninitialized if `loadTheme` is never called

**Severity:** Low

```typescript
private theme: Theme;
```

This is not a compiler error in this repo because `strictPropertyInitialization` is disabled. The constructor always calls `loadTheme` via one of four branches, so in practice `theme` is always set today. But if a future refactor adds an early return before `loadTheme`, `getTheme()` returns `undefined` typed as `Theme`.

**Recommendation:** Initialize to a default: `private theme: Theme = 'dark';`.

---

### 2. `loadStyle` uses `getElementById('theme')` but sets it as a `<link>` — type cast could be wrong

**Severity:** Informational

```typescript
const themeLink: HTMLLinkElement | null = this.document.getElementById('theme') as HTMLLinkElement | null;
```

`getElementById` can return any `HTMLElement`. If some other element has `id="theme"` (e.g., a `<div>`), the cast succeeds at compile time but `themeLink.href = styleName` would silently fail or set a property on the wrong element type at runtime. Since the only element with `id="theme"` in this codebase is the one created by this service, this is safe in practice.

---

## No Other Issues Found

- The three-branch `matchMedia` check with a dark fallback is correct.
- Storing the theme via `setAttribute('data-theme', ...)` and a dynamically-loaded CSS file is a clean CSS-variable-based theming pattern.
- `getStoredTheme` correctly validates the stored string against `availableThemes` before trusting it.
