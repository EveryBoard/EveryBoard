# Review: `app/firebaseConfig.ts`

## Summary
Firebase configuration file. Contains what appears to be API keys for a test/dev project.

---

## Findings

### 1. API key and project credentials committed to source control

**Severity:** Informational (Firebase public keys)

```typescript
apiKey: 'AIzaSyBXvPhpjIS0Ov0uoZLA3YhI5OrFe8lePqs',
```

Firebase API keys for web projects are not secret in the same way as backend secrets — they are intentionally embedded in client-side code and security is enforced via Firebase Security Rules. However, committing them to source control still has risks:
- The load-test config (commented out) includes credentials for a different project.
- If these keys are ever accidentally used in production they could incur charges.

The current active config points to `everyboard-test`, not production. Verify that this file is replaced with environment-specific values at build time for production.

---

### 2. Commented-out load-test config with API key

**Severity:** Low

The commented block contains an API key for `everyboard-loadtest`. Leaving it in the committed code means the key is permanently in git history even if removed later.

---

## No Other Issues Found
