# Review: `games/connect-six/ConnectSixMoveGenerator.ts`

## Summary
Move generator for Connect Six. One informational finding.

---

## Findings

### 1. `getListDrops` copies the board once per available first coordinate

**Severity:** Informational

```typescript
for (const firstCoord of availableFirstCoords) {
    const board: PlayerOrNone[][] = node.gameState.getCopiedBoard();
    ...
}
```

`getCopiedBoard()` is O(width × height) and is called once per available first coordinate. Combined with the inner loop over second coordinates, the overall cost is O(n × w × h + n²) where n is the number of available cells. On large boards this can be slow. A single board copy reused across iterations (with manual undo after each first drop) would be more efficient.

---

## No Other Issues Found

- `getUsefulCoordsMap` correctly restricts candidates to cells adjacent to existing pieces.
- `new Set(moves).toList()` correctly deduplicates commutative pairs via `ConnectSixDrops.equals`.
