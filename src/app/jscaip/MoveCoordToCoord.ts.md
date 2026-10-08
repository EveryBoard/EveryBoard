# Review: `jscaip/MoveCoordToCoord.ts`

## Summary
Solid. One naming ambiguity between `getMovedOverCoords` and `getJumpedOverCoords`.

---

## Findings

### 1. `getMovedOverCoords` vs `getJumpedOverCoords` — unclear distinction

**Severity:** Low (documentation gap)

```typescript
public getMovedOverCoords(): Coord[] {
    return this.getStart().getAllCoordsToward(this.getEnd());
}
public getJumpedOverCoords(): Coord[] {
    return this.getStart().getCoordsToward(this.getEnd());
}
```

The difference between `getAllCoordsToward` and `getCoordsToward` is not documented here and requires reading `Coord.ts`. Callers selecting the wrong method would compute incorrect intermediate coordinates. The names are easy to confuse.

**Recommendation:** Add inline documentation stating what each method includes (e.g., whether it includes start/end, or only intermediate cells).

---

### 2. Constructor throws for same-coord moves

**Severity:** Informational (intentional)

```typescript
if (start.equals(end)) throw new Error(RulesFailure.MOVE_CANNOT_BE_STATIC());
```

This is correct game logic for "coord to coord" moves. The throw is preferable to returning an `MGPFallible` here since it enforces a class invariant (an `MoveCoordToCoord` is always non-static). Documented for completeness.

---

## No Other Issues Found

- `equals` correctly compares both start and end coords.
- `getDistance` and `getDirection` are straightforward delegates to `Coord`.
