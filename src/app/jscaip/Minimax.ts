import { ComparableObject } from '../utils/Comparable';
import { GamePartSlice } from './GamePartSlice';
import { LegalityStatus } from './LegalityStatus';
import { MGPNode } from './MGPNode';
import { Move } from './Move';
import { NodeUnheritance } from './NodeUnheritance';
import { Rules } from './Rules';

export abstract class Minimax<M extends Move,
                              S extends GamePartSlice,
                              L extends LegalityStatus = LegalityStatus,
                              U extends NodeUnheritance = NodeUnheritance> implements ComparableObject
{

    public constructor(public readonly name: string) {
    }
    public abstract getListMoves(node: MGPNode<Rules<M, S, L, U>, M, S, L, U>,
                                 minimax: Minimax<M, S, L, U>)
    : M[];
    /* has to be implemented for each rule so that the AI can choose amongst theses informations
     * this function could give an incomplete set of data if some of them are redondant
     * or also if some of them are too bad to be interesting to count, as a matter of performance
     */

    public getBoardNumericValue(move: M, state: S): number {
        console.log('getBoardNumericValue UEUEUDUXKERJIE');
        const boardInfo: unknown = this.getBoardValue(move, state);
        if (typeof boardInfo === 'number') {
            return boardInfo;
        } else {
            return (boardInfo as U).value;
        }
    }
    public abstract getBoardValue(move: M, slice: S): U;
    /* used to give a comparable data type linked to the gameSlicePart of the moment
     * so that the AI can know what is best, according to you algorithm in there
     */

    public equals(o: ComparableObject): boolean {
        return false; // since it's singletons
    }
    public toString(): string {
        return this.name;
    }
}
