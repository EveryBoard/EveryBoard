# Review: `app/app.component.ts`

## Summary
Clean root component. Two minor notes.

---

## Findings

### 1. Services injected into `_themeService` and `_errorLoggerService` only for side-effect initialization

**Severity:** Informational

```typescript
private readonly _themeService: ThemeService = inject(ThemeService);
private readonly _errorLoggerService: ErrorLoggerService = inject(ErrorLoggerService);
```

These fields are never read — they're injected purely to trigger Angular's DI and execute the service constructors. The leading underscore is a common convention for "unused but required" fields. This is a valid Angular pattern, but a comment explaining why these are injected here (to ensure early initialization) would clarify intent.

---

### 2. Social media icons are `public` fields

**Severity:** Informational

```typescript
public faTwitter: IconDefinition = faTwitter;
```

These are template-binding fields, which Angular requires to be accessible. The convention of making them `public` is correct. `readonly` would be appropriate since they never change.

---

## No Other Issues Found
