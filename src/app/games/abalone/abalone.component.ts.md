# Review: `games/abalone/abalone.component.ts`

## Summary
Abalone game component with complex multi-step click handling. No confirmed runtime bug found; two low-confidence/readability concerns remain.

---

## Findings

### 1. `showSideStepMove` has dead/edge-case fallen-piece display logic

**Severity:** Low / not confirmed

```typescript
// Since only current player could have translated out their pieces
const previousPlayer: Player = this.getState().getPreviousPlayer();
this.captureds.push({
    coord: landing,
    pieceClasses: [this.getPlayerClass(previousPlayer)],
});
```

`showLastMove` is called to display the previous move. At that point, `this.getState()` returns the state **after** the move was applied, so `getPreviousPlayer()` returns the player who made the move. That is the color the comment intends to show. Also, standard Abalone side-step moves should not eject pieces off board, so this branch appears to be defensive/dead display logic rather than a confirmed bug.

---

### 2. `deselectExtremity` uses `slice(start, end)` with `-1` to exclude the last element

**Severity:** Cosmetic

```typescript
const end: number | undefined = first ? undefined : -1;
this.selecteds = this.selecteds.slice(start, end);
```

When deselecting the last extremity (`first = false`), `slice(0, -1)` is used, which intentionally drops the last element. When `first = true`, `slice(1, undefined)` drops the first element. Both cases are correct; the only issue is readability.

---

### 3. `tryExtension` calls `cancelMove` and then `firstClick` in sequence — `cancelMove` return value discarded

**Severity:** Informational

```typescript
const legality: MGPValidation = await this.cancelMove(AbaloneFailure.LINE_AND_COORD_NOT_ALIGNED());
await this.firstClick(clicked);
return legality;
```

`cancelMove` is awaited, then `firstClick` is immediately called. This means even though the move fails with a reason, the component transitions to a first-click state for the clicked coord. The failure validation is returned but the UI has already started a new click sequence. This seems intentional (fail but start fresh), but the interaction may confuse users — the error message appears but a piece is already selected.

---

## No Other Issues Found

- Click handling state machine (0, 1, 2+ selected pieces) is logically consistent.
- Direction arrows correctly computed from legal moves.
- `boardNeighboringCoords` uses `Set` for deduplication correctly.
