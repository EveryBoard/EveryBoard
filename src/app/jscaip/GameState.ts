import { Player } from './Player';

export abstract class GameState {

    public constructor(public readonly turn: number) {
    }
    public getCurrentPlayer(): Player {
        return Player.fromTurn(this.turn);
    }
    public getCurrentOpponent(): Player {
        return this.turn % 2 === 1 ? Player.ZERO : Player.ONE;
    }
}
