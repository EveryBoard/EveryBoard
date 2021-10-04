import { Player } from './Player';

export abstract class GameState<C, P> {

    public constructor(public readonly turn: number) {
        if (turn == null) throw new Error('Turn cannot be null.');
    }
    public getCurrentPlayer(): Player {
        return Player.fromTurn(this.turn);
    }
    public getCurrentEnnemy(): Player {
        return this.turn % 2 === 1 ? Player.ZERO : Player.ONE;
    }
    public abstract getBoardAt(coord: C): P;

    public abstract isOnBoard(coord: C): boolean

    public abstract getNullable(coord: C): P | null;

    public setAtUnsafe(coord: C, v: P): this {
        throw new Error('Should be overridden');
    }
    public setAt(coord: C, v: P): this {
        if (this.isOnBoard(coord)) {
            return this.setAtUnsafe(coord, v);
        } else {
            throw new Error('Setting coord not on board: ' + coord + '.');
        }
    }
}
export abstract class AbstractGameState extends GameState<unknown, unknown> {
}
