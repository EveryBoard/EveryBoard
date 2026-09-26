# Review: `components/normal-component/settings/settings.component.ts`

## Summary
Settings component for language and theme selection. One issue found.

---

## Findings

### 1. `window.open(window.location.href, '_self')` is non-standard for page reload

**Severity:** Informational

```typescript
private reload(): void {
    window.open(window.location.href, '_self');
}
```

`window.open(..., '_self')` works but is unusual — `window.location.reload()` or `window.location.href = window.location.href` is the standard idiom for forcing a full page reload. Some popup blockers may intercept `window.open` calls, though `_self` reduces this risk. The comment explains the intent.

---

## No Other Issues Found

- Language and theme options are statically defined and non-dynamic.
- Reading current theme/language in constructor is correct.
