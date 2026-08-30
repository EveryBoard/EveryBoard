# Review: `utils/ObservableSubject.ts`

## Summary
Thin pairing type. One concern about mutability and the `eslint-disable` comment.

---

## Findings

### 1. Both fields are `public` — encapsulation bypassed

**Severity:** Low

```typescript
public subject: BehaviorSubject<T>,
public observable: Observable<T>
```

Callers can replace either field. Typically you'd want `subject` to be internal and expose only `observable` publicly. `readonly` would at least prevent field reassignment.

---

### 2. `eslint-disable max-lines-per-function` is unnecessary

**Severity:** Informational

The file has 9 lines. The disable comment serves no purpose and likely represents a copy-paste from a larger file.

---

## No Other Issues Found
