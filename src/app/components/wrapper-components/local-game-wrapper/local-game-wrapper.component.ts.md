# Review: `components/wrapper-components/local-game-wrapper/local-game-wrapper.component.ts`

## Summary
Main local game wrapper. Three bugs: `takeBack` doesn't reset `endGame`/`winnerMessage`, `availableAIOptions` can throw when called for a non-AI player, and the AI move timer has no cancellation on restart/takeback.

---

## Findings

### 1. `takeBack` does not reset `endGame` or `winnerMessage`

**Severity:** High

```typescript
public async takeBack(): Promise<void> {
    this.gameComponent.node = this.gameComponent.node.parent.get();
    // ...
    await this.showCurrentState(false);
    // endGame and winnerMessage are NOT reset
}
```

If the game ended and the user clicks "Take Back," `this.endGame` remains `true` and `this.winnerMessage` retains the end-game message. The board is re-rendered without the `endgame-bg` class being removed (since `getBoardHighlight` returns `['endgame-bg']` when `endGame` is true), and the winner message stays on screen. The game appears to have ended even though play has resumed.

**Recommendation:** Reset `this.endGame = false` and `this.winnerMessage = MGPOptional.empty()` in `takeBack`.

---

### 2. `availableAIOptions` calls `.get()` without guard — throws if no AI selected

**Severity:** Medium

```typescript
public availableAIOptions(player: number): AIOptions[] {
    return this.getAI(player).get().availableOptions;
}
```

`getAI` returns `MGPOptional.empty()` if no AI is selected for the player. `.get()` on an empty optional throws. The template presumably only calls this when an AI is selected, but there is no programmatic guard.

**Recommendation:** Add `return this.getAI(player).getOrElse(/* some default */ ...).availableOptions` or assert presence.

---

### 3. AI `setTimeout` is not cancelled on game restart or take-back

**Severity:** Low

```typescript
setTimeout(async() => {
    // ...
    if (gameIsOngoing) {
        await this.doAIMove(playingAI.get().ai, playingAI.get().options);
    }
}, LocalGameWrapperComponent.AI_TIMEOUT);
```

The timer ID is not stored and cannot be cancelled. If the user restarts the game or takes back before the 1.5-second timeout fires, the callback still runs. The `gameIsOngoing` check prevents the AI from playing on a finished game, but it uses the current `node` which has been reset. After a restart, the first AI call would check the initial (ongoing) state and actually trigger an AI move — causing a spurious AI move immediately after restart.

**Recommendation:** Store the `setTimeout` result and call `clearTimeout` in `restartGame` and `takeBack`.

---

### 4. `lastMoveWasAI` modular arithmetic can produce -1 for turn 0

**Severity:** Informational

```typescript
const playerIndex: number = (this.gameComponent.getTurn() - 1) % 2;
```

In JavaScript, `(-1) % 2 = -1` (negative modulo). This is only reached from `applyNewMove` which is called after a legal move (turn ≥ 1), so turn 0 is never hit in practice. A guard or `((turn - 1 + 2) % 2)` would be more defensive.

---

## No Other Issues Found

- `onLegalUserMove` safely calls `.choose().get()` because the move was already validated in `receiveValidMove`.
- The AI check `gameIsOngoing` in the timer callback correctly prevents AI moves after game end, but it does not prevent stale AI timers from acting on a restarted ongoing game.
- `canTakeBack` correctly prevents take-back when turn ≤ 0 (or ≤ 1 for AI-playing player 0).
