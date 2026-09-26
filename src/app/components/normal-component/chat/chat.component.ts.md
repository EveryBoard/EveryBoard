# Review: `components/normal-component/chat/chat.component.ts`

## Summary
Chat component with scroll management. Two issues found.

---

## Findings

### 1. `updateCurrentScrollPosition` uses non-null assertion on potentially undefined signal

**Severity:** Medium

```typescript
const position: number = this.chatDiv()!.nativeElement.scrollTop + this.chatDiv()!.nativeElement.offsetHeight;
const height: number = this.chatDiv()!.nativeElement.scrollHeight;
```

`chatDiv()` can return `undefined` if the view query hasn't resolved (e.g., during SSR or if the element is conditionally hidden). `scrollToBottom()` correctly guards with `if (chatDiv == null)`, but `updateCurrentScrollPosition` does not — calling it before the view is ready would throw.

---

### 2. `formatTimestamp` hardcodes `'en-US'` locale

**Severity:** Informational

```typescript
return formatDate(timestamp, 'HH:mm:ss', 'en-US');
```

Timestamps are formatted for all users in the US locale. Should use the Angular `LOCALE_ID` token for consistency with the rest of the app.

---

### 3. `scrollTo` uses non-null assertion after `scrollToBottom` already guarded

**Severity:** Cosmetic

```typescript
public scrollTo(position: number): void {
    this.chatDiv()!.nativeElement.scroll({ ... });
}
```

`scrollTo` is called from `scrollToBottom` after a null check, but `scrollTo` itself uses `!` which bypasses any further checking. If `scrollTo` is ever called from other paths in the future, it could throw.

---

## No Other Issues Found

- Chat subscription is correctly unsubscribed in `ngOnDestroy`.
- `sendMessage` clears input before the async call — good UX.
- `switchChatVisibility` correctly resets read count and scrolls when showing.
