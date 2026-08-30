# Review: `jscaip/state/PlayerOrNoneGameStateWithTable.ts`

## Summary
Minimal class. The `as Player` cast is safe. One minor concern.

---

## Findings

### 1. `isEmptyAt` does not guard for out-of-board coords

**Severity:** Low

```typescript
public isEmptyAt(coord: Coord): boolean {
    return this.hasPieceAt(coord, PlayerOrNone.NONE);
}
```

`hasPieceAt` returns `false` for out-of-board coords (it checks `isOnBoard` first), so `isEmptyAt` returns `false` for off-board coords. This is arguably correct — an off-board cell is not "empty" in the game sense — but it could mask callers that accidentally pass off-board coords expecting a different response. There is no documentation indicating this behavior.

---

## No Other Issues Found

- `getPlayerCoordsAndContent` correctly filters with `isPlayer()` before casting with `as Player`.
