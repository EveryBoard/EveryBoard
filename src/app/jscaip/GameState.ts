import { Player } from './Player';

export abstract class GameState<C, P> {

    public constructor(public readonly turn: number)
    {
        if (turn == null) throw new Error('Turn cannot be null.');
    }
    public getCurrentPlayer(): Player {
        return Player.fromTurn(this.turn);
    }
    public getCurrentEnnemy(): Player {
        return this.turn % 2 === 1 ? Player.ZERO : Player.ONE;
    }
    public abstract getBoardAt(coord: C): P;

    public abstract getNullable(coord: C): P | null;
}
