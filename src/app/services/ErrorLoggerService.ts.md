# Review: `services/ErrorLoggerService.ts`

## Summary
Functional error-logging service. One field name typo in the Firestore schema, one race condition in deduplication, and a minor concern about static + DI singleton duplication.

---

## Findings

### 1. `occurences` field name is misspelled in the Firestore schema

**Severity:** Low

```typescript
occurences: 1,
// ...
occurences: previousError.occurences + 1,
```

"Occurrences" is the correct spelling. This misspelling is now baked into the Firestore document schema. Fixing it would require a data migration.

---

### 2. Race condition in error deduplication

**Severity:** Low

```typescript
const previousErrors = await this.findErrors(component, route, message, data);
if (previousErrors.length === 0) {
    await this.errorDAO.create(error);
} else {
    await this.errorDAO.update(previousErrors[0].id, { occurences: previousError.occurences + 1 });
}
```

Two simultaneous errors with identical signatures can both read `previousErrors.length === 0` before either write completes, producing duplicate documents. Deduplication only works correctly for sequential errors. A Firestore transaction would be needed for true atomicity, but given the low frequency of errors, this is probably acceptable.

---

### 3. Static singleton duplicates Angular's DI singleton guarantee

**Severity:** Informational

`providedIn: 'root'` already ensures a single instance via Angular's DI. The static `singleton` field + `private constructor` is a second singleton layer added to support the static `logError` method. This works, but it means:
- If Angular's DI creates the instance lazily and `logError` is called before injection, it throws.
- The `private constructor` doesn't actually prevent Angular from constructing the service (TypeScript `private` is compile-time only; DI uses reflection).

A cleaner alternative: inject the service into the `Utils.logError` callers rather than using a static accessor.

---

## No Other Issues Found

- The static `logError` correctly returns `MGPValidation.failure(...)` synchronously while logging asynchronously.
- `findErrors` with multi-field queries will need composite Firestore indexes (a deployment concern, not a code bug).
- `messageDisplayer.criticalMessage` is correctly invoked before the async Firestore work.
