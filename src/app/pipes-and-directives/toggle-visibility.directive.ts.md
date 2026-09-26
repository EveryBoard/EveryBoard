# Review: `pipes-and-directives/toggle-visibility.directive.ts`

## Summary
Password visibility toggle directive. Relies on fragile DOM traversal (`parentNode.previousSibling`) that breaks with any template structure change.

---

## Findings

### 1. DOM traversal to find the password input is fragile

**Severity:** Medium

```typescript
this.input = element.nativeElement.parentNode.previousSibling;
```

This traverses from the toggle button element to its parent, then to the previous sibling — implicitly assuming a specific template structure where the password `<input>` is the element immediately before the parent of the button. Any change to the template (wrapping the input in a div, adding a sibling element, reordering) silently breaks this by making `this.input` point to the wrong element or `null`.

`this.input` is typed as `HTMLElement` but `previousSibling` returns `ChildNode | null` — if there's no previous sibling (or the previous sibling is a text node), `this.input` is `null` or a non-`HTMLElement` node. Calling `setAttribute` on `null` or a text node throws at runtime.

**Recommendation:** Pass the target input via a directive input (`@Input() toggleTarget: HTMLInputElement`) or use a `@ContentChild` query, rather than relying on DOM position.

---

### 2. `addEventListener` instead of `@HostListener` — bypasses Angular's change detection

**Severity:** Low

```typescript
element.nativeElement.addEventListener('click', (_: Event) => {
    this.toggle();
});
```

Using the native `addEventListener` bypasses Angular's `NgZone`. If `toggle` causes view changes that Angular needs to detect, they may not trigger change detection. `@HostListener('click')` is the Angular-idiomatic approach and runs inside the zone.

In this case, `toggle` only sets DOM attributes directly (bypassing Angular's binding system entirely), so change detection is not needed. But the pattern is fragile if the component is later refactored to use Angular bindings.

---

## No Other Issues Found

- The toggle logic (`shown = shown === false`) is semantically equivalent to `!shown`.
- Focusing the input after toggling type is a good UX touch.
