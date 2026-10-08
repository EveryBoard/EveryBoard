# Review: `dao/ErrorDAO.ts`

## Summary
Minimal DAO for error documents. One spelling note (carried over from `ErrorLoggerService`).

---

## Findings

### 1. `occurences` field is misspelled

**Severity:** Low (schema consistency note)

```typescript
occurences: number,
```

Should be "occurrences". This matches the misspelling in `ErrorLoggerService.ts` — both the type and the service must use the same spelling to interoperate. If corrected, both must be updated together with a Firestore data migration.

---

## No Other Issues Found

- `MGPError` type is well-structured with optional `data` field.
- `FirestoreTime` for timestamp fields is the correct Firestore type.
- `ErrorDAO` correctly delegates to `FirestoreDAO<MGPError>` with the `'errors'` collection name.
