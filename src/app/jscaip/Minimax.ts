import { ComparableObject } from '../utils/Comparable';
import { MGPNode } from './MGPNode';
import { Move } from './Move';
import { NodeUnheritance } from './NodeUnheritance';
import { Rules } from './Rules';
import { GameState } from './GameState';

export abstract class Minimax<M extends Move,
                              S extends GameState,
                              L = void,
                              U extends NodeUnheritance = NodeUnheritance,
                              R extends Rules<M, S, L> = Rules<M, S, L>> implements ComparableObject
{

    public constructor(public readonly ruler: R,
                       public readonly name: string) {
    }
    /**
     * has to be implemented for each rule so that the AI can choose amongst theses informations
     * this function could give an incomplete set of data if some of them are redondant
     * or also if some of them are too bad to be interesting to count, as a matter of performance
     */
    public abstract getListMoves(node: MGPNode<R, M, S, L>): M[];

    public getBoardNumericValue(node: MGPNode<R, M, S, L>): number {
        const boardInfo: unknown = this.getBoardValue(node);
        if (typeof boardInfo === 'number') {
            return boardInfo;
        } else {
            return (boardInfo as U).value;
        }
    }
    /**
     * used to give a comparable data type linked to the GameState of the moment
     * so that the AI can know what is best, according to you algorithm in there
     */
    public abstract getBoardValue(node: MGPNode<R, M, S, L>): U;

    public equals(o: ComparableObject): boolean {
        return false; // since it's singletons
    }
    public toString(): string {
        return this.name;
    }
}

export abstract class AbstractMinimax extends Minimax<Move, GameState, unknown> {
}
