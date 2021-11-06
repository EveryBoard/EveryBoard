import { Player } from './Player';

export abstract class GameState<C, P> {

    public constructor(public readonly turn: number) {
    }
    public getCurrentPlayer(): Player {
        return Player.fromTurn(this.turn);
    }
    public getCurrentOpponent(): Player {
        return this.turn % 2 === 1 ? Player.ZERO : Player.ONE;
    }
    public abstract getPieceAt(coord: C): P;

    public abstract isOnBoard(coord: C): boolean

    // TODO FOR REVIEW: removed because it is actually not needed
    // TODO FOR REVIEW: the games that want to define it can, but it is not necessary to force its definition
    // public abstract getNullable(coord: C): P | null;
}
export abstract class AbstractGameState extends GameState<unknown, unknown> {
}
