import { MGPNode } from './MGPNode';
import { Move } from './Move';
import { BoardValue } from './BoardValue';
import { Rules } from './Rules';
import { GameState } from './GameState';

export abstract class Minimax<M extends Move,
                              S extends GameState,
                              L = void,
                              U extends BoardValue = BoardValue,
                              R extends Rules<M, S, L> = Rules<M, S, L>>
{

    public constructor(public readonly ruler: R, // TODO: we don't need this here, remove it
                       public readonly name: string) {
    }
    /**
     * has to be implemented for each rule so that the AI can choose amongst theses informations
     * this function could give an incomplete set of data if some of them are redondant
     * or also if some of them are too bad to be interesting to count, as a matter of performance
     */
    public abstract getListMoves(node: MGPNode<R, M, S, L>): M[];

    /**
     * used to give a comparable data type linked to the GameState of the moment
     * so that the AI can know what is best, according to you algorithm in there
     */
    public abstract getBoardValue(node: MGPNode<R, M, S, L>): U;

    public toString(): string {
        return this.name;
    }
}

export abstract class AbstractMinimax extends Minimax<Move, GameState, unknown> {
}
