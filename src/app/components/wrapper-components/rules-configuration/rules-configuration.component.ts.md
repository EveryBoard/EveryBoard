# Review: `components/wrapper-components/rules-configuration/rules-configuration.component.ts`

## Summary
Configuration component with reactive forms. Two issues: `'Custom'` string literal comparison may break in non-English locales, and `getErrorMessage` has a type annotation too narrow for non-numeric config fields.

---

## Findings

### 1. `'Custom'` string literal comparison may break under localization

**Severity:** Medium

```typescript
public isEditableAndCustom(): boolean {
    return this.editable() && this.chosenConfigName === 'Custom';
}

private setChosenConfig(configName: string): void {
    this.chosenConfigName = configName;
    if (this.chosenConfigName === 'Custom') { ... }
}
```

The hardcoded `'Custom'` is compared against `chosenConfigName`, which is set from `select.value` in `onChange`. If the template uses `RulesConfigDescriptionLocalizable.CUSTOM()` (a localized string) as the select option value, then in French the value would not be `'Custom'` — breaking `isEditableAndCustom()` and `setChosenConfig`.

`getDefactoConfigName()` returns `RulesConfigDescriptionLocalizable.CUSTOM()` when no standard config matches, further mixing localized and literal comparisons.

**Recommendation:** Use a non-localized sentinel constant (e.g., `'__custom__'`) for the custom config name internally, and only localize the display label.

---

### 2. `getErrorMessage` annotates value as `number | null` but config values can be string or boolean

**Severity:** Low

```typescript
const fieldValue: number | null = this.rulesConfigForm.controls[field].value;
```

Angular's `FormControl.value` is typed as `any`. The annotation `number | null` would be incorrect for `EnumConfig` (string) or `BooleanConfig` (boolean) fields. TypeScript won't catch this because `any` is assignable to everything, but if `getValidityError` uses strict validation, non-numeric fields would be mishandled.

---

### 3. `getFormControl` subscriptions not explicitly cleaned up

**Severity:** Informational

```typescript
formControl.valueChanges.subscribe(() => {
    this.onUpdate();
});
```

Subscriptions to `FormControl.valueChanges` are not explicitly unsubscribed. When `generateForm` replaces the form group, old controls' subscriptions may linger until garbage collection. Angular's component destruction completes the observables, so this is not a hard leak, but explicit cleanup would be safer.

---

## No Other Issues Found

- `checkForValidators` correctly collects all validation errors and emits `MGPOptional.empty()` when any fails.
- `isSelectedConfig` correctly uses `comparableEquals` for deep config comparison.
- `setEditable` correctly toggles form enablement and updates the `editable` model signal.
