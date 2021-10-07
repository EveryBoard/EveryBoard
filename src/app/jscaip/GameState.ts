import { Player } from './Player';

export abstract class GameState<C, P> {

    public constructor(public readonly turn: number) {
        if (turn == null) throw new Error('Turn cannot be null.');
    }
    public getCurrentPlayer(): Player {
        return Player.fromTurn(this.turn);
    }
    public getCurrentOpponent(): Player {
        return this.turn % 2 === 1 ? Player.ZERO : Player.ONE;
    }
    public abstract getPieceAt(coord: C): P;

    public abstract isOnBoard(coord: C): boolean

    public abstract getNullable(coord: C): P | null;
}
export abstract class AbstractGameState extends GameState<unknown, unknown> {
}
