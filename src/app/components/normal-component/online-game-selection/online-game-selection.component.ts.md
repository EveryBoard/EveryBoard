# Review: `components/normal-component/online-game-selection/online-game-selection.component.ts`

## Summary
Game picker for online play. One naming issue found.

---

## Findings

### 1. `canUserJoin` variable name is misleading — it calls `canUserCreate`

**Severity:** Cosmetic

```typescript
const canUserJoin: MGPValidation = this.currentGameService.canUserCreate();
```

The variable is named `canUserJoin` but the method called is `canUserCreate`. The logic is semantically about creating a new game, not joining one. The variable name should be `canUserCreate` for clarity.

---

## No Other Issues Found

- Guards the creation flow correctly before navigating.
