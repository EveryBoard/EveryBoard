# Review: `components/wrapper-components/demo-card-wrapper/demo-card-wrapper.component.ts`

## Summary
Demo card wrapper that renders a read-only game state preview. Two issues found.

---

## Findings

### 1. `querySelector` result passed to `Utils.getNonNullable` — throws if element not found

**Severity:** Medium

```typescript
const element: Element =
    Utils.getNonNullable(this.elementRef.nativeElement.querySelector(clickSelector));
element.dispatchEvent(new Event('click'));
```

If `querySelector(clickSelector)` returns `null` (e.g., the click selector from the tutorial step doesn't match any rendered element), `Utils.getNonNullable` throws an assertion error. This is the same issue previously identified in `TutorialGameWrapperComponent`. The failure mode silently breaks the demo card without any user-visible error message. Should guard with a null check or use optional chaining.

---

### 2. `ngAfterViewInit` uses `setTimeout(..., 1)` to defer initialization

**Severity:** Informational

```typescript
public async ngAfterViewInit(): Promise<void> {
    setTimeout(async() => { ... }, 1);
}
```

The 1ms delay is a workaround to defer execution past Angular's change detection cycle. This is a known anti-pattern — using `Promise.resolve().then(...)` or `queueMicrotask` would be more predictable. More critically, the `async` callback inside `setTimeout` means any rejection is silently swallowed (not returned or handled).

---

### 3. `ngOnChanges` is `async` but Angular doesn't await lifecycle hooks

**Severity:** Informational

```typescript
public async ngOnChanges(_changes: SimpleChanges): Promise<void> { ... }
```

Angular calls `ngOnChanges` synchronously and ignores the returned Promise. If `gameComponent.updateBoardAndRedraw` rejects, the rejection is unhandled.

---

## No Other Issues Found

- `canUserPlay` correctly distinguishes between automated setup clicks and real user clicks.
- `onLegalUserMove` correctly asserts failure since demo cards should be read-only.
