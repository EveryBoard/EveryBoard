import { ComparableObject } from '../utils/Comparable';
import { LegalityStatus } from './LegalityStatus';
import { MGPNode } from './MGPNode';
import { Move } from './Move';
import { NodeUnheritance } from './NodeUnheritance';
import { Rules } from './Rules';
import { AbstractGameState } from './GameState';

export abstract class Minimax<M extends Move,
                              S extends AbstractGameState,
                              L extends LegalityStatus = LegalityStatus,
                              U extends NodeUnheritance = NodeUnheritance> implements ComparableObject
{

    public constructor(public readonly ruler: Rules<M, S, L>,
                       public readonly name: string) {
    }
    public abstract getListMoves(node: MGPNode<Rules<M, S, L>, M, S, L>): M[];
    /* has to be implemented for each rule so that the AI can choose amongst theses informations
     * this function could give an incomplete set of data if some of them are redondant
     * or also if some of them are too bad to be interesting to count, as a matter of performance
     */

    public getBoardNumericValue(node: MGPNode<Rules<M, S, L>, M, S, L>): number {
        const boardInfo: unknown = this.getBoardValue(node);
        if (typeof boardInfo === 'number') {
            return boardInfo;
        } else {
            return (boardInfo as U).value;
        }
    }
    public abstract getBoardValue(node: MGPNode<Rules<M, S, L>, M, S, L>): U;
    /* used to give a comparable data type linked to the GameState of the moment
     * so that the AI can know what is best, according to you algorithm in there
     */

    public equals(o: ComparableObject): boolean {
        return false; // since it's singletons
    }
    public toString(): string {
        return this.name;
    }
}
