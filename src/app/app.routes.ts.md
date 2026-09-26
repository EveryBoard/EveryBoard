# Review: `app/app.routes.ts`

## Summary
Well-structured lazy-loaded routes. One internal API usage concern and one minor route-ordering note.

---

## Findings

### 1. `firestore.toJSON()['settings'].host` accesses internal Firestore SDK state

**Severity:** Low

```typescript
const host: string = firestore.toJSON()['settings'].host;
if (environment.useEmulators && host !== 'localhost:8080') {
    Firestore.connectFirestoreEmulator(firestore, 'localhost', 8080);
}
```

`toJSON()['settings'].host` is not a documented public API of the Firestore SDK. It accesses an internal implementation detail to check if the emulator is already connected. A future SDK update could change this structure silently. The guard `host !== 'localhost:8080'` is there to prevent double-connection assertions — consider using a boolean flag instead.

Similarly for auth:
```typescript
if (environment.useEmulators && fireauth.config['emulator'] == null) {
```
`fireauth.config['emulator']` is also an internal property.

---

### 2. `local/:game/config` route must precede `local/:game` for correct matching

**Severity:** Informational

```typescript
{ path: 'local/:game/config', ... },
{ path: 'local/:game', ... },
```

Angular's router uses first-match wins. If `local/:game` were listed before `local/:game/config`, navigating to `local/Chess/config` would match `local/:game` with `game='Chess'` and never reach the config component. The current ordering is correct but should be maintained carefully if routes are ever reorganized.

---

## No Other Issues Found

- All lazy-loaded routes use `loadComponent` — correct for standalone Angular components.
- `**` wildcard route is correctly placed last.
- Guards are correctly applied to routes requiring authentication or game exclusivity.
