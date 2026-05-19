# Review: `dao/FirestoreDAO.ts`

## Summary
Solid Firestore abstraction. One silent interface/implementation mismatch (`order` and `limit` parameters ignored), and `collection` is unnecessarily `public`.

---

## Findings

### 1. `findWhere` implementation ignores `order` and `limit` declared in the interface

**Severity:** Medium

```typescript
// IFirestoreDAO interface:
findWhere(conditions: FirestoreCondition[], order?: string, limit?: number): Promise<FirestoreDocument<T>[]>

// FirestoreDAO implementation:
public async findWhere(conditions: FirestoreCondition[]): Promise<FirestoreDocument<T>[]>
```

The interface declares `order` and `limit` as optional parameters, but the concrete `FirestoreDAO.findWhere` ignores them entirely — they are not in the parameter list and not applied to the query. Any caller passing these arguments receives silently unbounded, unordered results.

**Recommendation:** Either add `order` and `limit` support to `constructQuery`, or remove these parameters from the interface if they are not needed.

---

### 2. `collection` is `public readonly` — bypasses DAO encapsulation

**Severity:** Low

```typescript
public readonly collection: Firestore.CollectionReference<T>;
```

Exposing the raw Firestore collection reference allows external code to bypass the DAO interface and issue arbitrary Firestore queries directly. Should be `private readonly`, with any needed cross-DAO operations going through new DAO methods.

---

### 3. `exists` reads the full document to check existence

**Severity:** Informational

```typescript
public async exists(id: string): Promise<boolean> {
    return (await this.read(id)).isPresent();
}
```

`read` downloads the full Firestore document. For existence checks on large documents, this is wasteful. Firestore's SDK doesn't expose a true "check existence without data" API, so this is an SDK limitation, not a code bug — but worth noting.

---

## No Other Issues Found

- `subscribeToChanges` wrapping Firestore's `onSnapshot` unsubscribe in a `Subscription` teardown is correct.
- `constructQuery` correctly chains `Firestore.where` constraints.
- `create` using `addDoc` correctly returns the auto-generated document ID.
