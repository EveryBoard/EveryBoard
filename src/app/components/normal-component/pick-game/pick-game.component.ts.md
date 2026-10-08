# Review: `components/normal-component/pick-game/pick-game.component.ts`

## Summary
Game registry (`GameInfo`) and search picker component. Two issues found.

---

## Findings

### 1. `getByUrlName` assertion uses unformatted template string

**Severity:** Cosmetic

```typescript
Utils.assert(games.length <= 1, `There should only be one game matching $urlName!`);
```

The template literal uses `$urlName` instead of `${urlName}`. The variable is not interpolated — the assertion message will literally say `$urlName` instead of the actual URL name. Should be `${urlName}`.

---

### 2. `Fuse` instance created on every search keystroke

**Severity:** Informational

```typescript
const fuse: Fuse<GameInfo> = new Fuse(this.games, { ... });
```

A new `Fuse` instance is constructed on every `search()` call, re-indexing all games each time. Since the game list is static, the `Fuse` instance could be created once and reused. For 43 games this is negligible, but it's a pattern that scales poorly.

---

### 3. `ALL_GAMES` is a public-visible mutable static array

**Severity:** Informational

```typescript
private static ALL_GAMES: GameInfo[] = [];
```

The field is `private`, but the `getAllGames()` method returns the array by reference. Callers could mutate it. `getAllGames()` could return a copy (`[...GameInfo.ALL_GAMES]`) or freeze the array after construction.

---

## No Other Issues Found

- Singleton lazy-initialization pattern is correct.
- `normalize` diacritic stripping with NFKD is well-implemented.
- `display` flag exists in the constructor but is never used in filtering — appears unused.
