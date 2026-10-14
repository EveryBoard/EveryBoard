# Review: `components/normal-component/demo-page/demo-page.component.ts`

## Summary
Demo page that renders tutorial states as preview cards. Two issues found.

---

## Findings

### 1. `fillColumns` is incorrect when `numberOfColumns` changes to a larger value

**Severity:** Medium

```typescript
if (i < numberOfColumns) {
    this.columns.push([]);
}
```

`i` tracks the total number of nodes processed, not the number of columns created. When `numberOfColumns` is larger than the number of demo nodes, columns beyond the node count are never created. When it's smaller, extra columns from a previous call are not cleaned up (this is fine since `this.columns = []` resets). The real issue: the condition `i < numberOfColumns` will stop creating new columns once `i >= numberOfColumns`, even if we're starting a fresh `columns = []` array. For example, if there are 3 nodes and 5 columns, columns 3 and 4 are never initialized, causing an `undefined` push at `this.columns[column].push(node)` for the 4th and 5th columns — though in practice the loop won't reach those indices because there are only 3 nodes. The logic works for the common case but the intent is confusing and fragile.

---

### 2. `getNodeFromStep` calls `legalityStatus.get()` without checking legality

**Severity:** Medium

```typescript
const legalityStatus: MGPFallible<unknown> = rules.isLegal(move, state, stepConfig);
const resultingState: GameState = rules.applyLegalMove(move, state, stepConfig, legalityStatus.get());
```

If a tutorial step's solution move is illegal under the given state/config (e.g., due to a stale tutorial), `isLegal` returns a failure and `.get()` will throw. There is no guard for the failure case. Should check `legalityStatus.isSuccess()` before calling `.get()`.

---

### 3. `numberOfColumns.valueChanges` subscription never unsubscribed

**Severity:** Informational

The `FormControl.valueChanges` subscription created in the constructor is never stored or unsubscribed. Since this component is destroyed when navigating away, this creates a minor subscription leak unless Angular's `DestroyRef` or `takeUntilDestroyed` is used.

---

## No Other Issues Found

- Column distribution (round-robin fill) is correct for the common case.
- `step.config.getOrElse(defaultConfig)` correctly falls back to default config.
