# Review: `components/normal-component/welcome/welcome.component.ts`

## Summary
Welcome page with game picker and creation entry points. Two issues found.

---

## Findings

### 1. Services are `public` instead of `private`

**Severity:** Cosmetic

```typescript
public readonly router: Router = inject(Router);
public readonly messageDisplayer: MessageDisplayer = inject(MessageDisplayer);
public readonly currentGameService: CurrentGameService = inject(CurrentGameService);
```

All three injected services are unnecessarily `public`. They should be `private` — templates access them only through the public methods on the component.

---

### 2. Column fill logic has same bug as `DemoPageComponent.fillColumns`

**Severity:** Medium

```typescript
for (let i: number = 0; i < allGames.length; i++) {
    if (i < this.numberOfColumns) {
        this.games.push([]);
    }
    this.games[column].push(allGames[i]);
    column = (column + 1) % this.numberOfColumns;
}
```

The condition `i < this.numberOfColumns` to create new column arrays is correct when the number of games exceeds the number of columns (which it always does here). However, this is fragile — if there were fewer games than columns, `this.games[column]` would access an undefined array and throw on `.push()`. The same pattern exists in `DemoPageComponent` and is acceptable given the invariant holds, but the intent is obscured.

---

## No Other Issues Found

- `createGame` correctly delegates validation to `canUserCreate` before navigating.
- `pickGame` / `closeInfo` manage the selected game detail panel cleanly.
