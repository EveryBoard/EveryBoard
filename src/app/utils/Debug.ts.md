# Review: `utils/Debug.ts`

## Summary
Functional debug utility with localStorage-based verbosity and a class decorator. Two issues: the `log` decorator wraps `constructor` unnecessarily and will assert-fail on getter/setter properties, and async method results are stringified as empty Promise objects.

---

## Findings

### 1. `log` decorator iterates `constructor` and will assert-fail on getters/setters

**Severity:** Medium

```typescript
for (const propertyName of Object.getOwnPropertyNames(constructor['prototype'])) {
    const descriptor = Utils.getNonNullable(Object.getOwnPropertyDescriptor(...));
    const isMethod: boolean = descriptor.value instanceof Function;
    Utils.assert(isMethod, 'cannot add logging to properties that are not methods!');
```

`Object.getOwnPropertyNames(prototype)` includes `'constructor'` and any getter/setter properties. For getter/setter properties, `descriptor.value` is `undefined` and `isMethod` is `false`, causing the assertion to throw. The comment acknowledges this ("we can simply ignore the cases that are not method") but does not implement the skip.

**Recommendation:** Change the assert to a `continue`:
```typescript
if (!isMethod) continue;
```

---

### 2. `log` decorator logs async method results as `'{}'` (unresolved Promise)

**Severity:** Low

```typescript
const result: unknown = originalMethod.apply(this, args);
if (Debug.isMethodVerboseExit(className, propertyName)) {
    console.log(`< ${className}.${propertyName} -> ${Debug.getStringified(result as object)}`);
}
return result;
```

For `async` methods, `result` is a Promise. `getStringified(promise)` returns `'{}'` since promises have no enumerable properties. The actual resolved value is never logged. This is debug-only but makes exit logging useless for async methods.

---

### 3. `isVerbose` `catch` swallows the `Utils.assert` error message

**Severity:** Low

```typescript
try {
    // ...
    Utils.assert(Array.isArray(verbosity[name]), `malformed verbosity levels for ${name}: ...`);
    // ...
} catch {
    throw new Error(`malformed verbosity object: ${verbosityJSON}`);
}
```

If the `Utils.assert` inside the `try` fires (verbosity entry is not an array), the original message is swallowed and replaced with the generic "malformed verbosity object" message. This makes debugging corrupted localStorage harder.

---

### 4. `isVerbose` reads `localStorage` twice per call site

**Severity:** Informational

`isMethodVerboseEntry` calls `isVerbose` twice (once for className, once for className.methodName), each reading from `localStorage`. In non-verbose mode (the default), this is always 4 localStorage reads per method invocation. Caching the verbosity object at startup would eliminate this overhead.

---

## No Other Issues Found

- `getStringified` correctly catches circular-reference JSON errors.
- `window['enableLog'] = Debug.enableLog` correctly exposes the function for console use; no `this` binding needed since `enableLog` uses only static methods.
