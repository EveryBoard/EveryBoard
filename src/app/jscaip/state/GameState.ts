import { Player } from '../Player';
import { RulesConfig } from '../RulesConfigUtil';

export type GameStateAndConfig = GameState | { state: GameState; config: RulesConfig };

export abstract class GameState {

    public static getStateAndNotConfig(stateOrConfig: GameStateAndConfig): GameState {
        if (stateOrConfig instanceof GameState) {
            return stateOrConfig;
        } else {
            return stateOrConfig.state;
        }
    }

    public constructor(public readonly turn: number) {
    }

    public getCurrentPlayer(): Player {
        return Player.ofTurn(this.turn);
    }

    public getPreviousOpponent(): Player {
        return this.getCurrentPlayer();
    }

    public getCurrentOpponent(): Player {
        return this.turn % 2 === 1 ? Player.ZERO : Player.ONE;
    }

    public getPreviousPlayer(): Player {
        return this.getCurrentOpponent();
    }

}
