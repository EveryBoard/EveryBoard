import { Utils } from '@everyboard/lib';
import { DiaballikMove } from './DiaballikMove';
import { DiaballikMoveGenerator, DiaballikMoveInConstruction } from './DiaballikMoveGenerator';
import { DiaballikNode } from './DiaballikRules';

export class DiaballikFilteredMoveGenerator extends DiaballikMoveGenerator {

    public constructor(public readonly moveLength: number,
                       avoidDuplicates: boolean = true)
    {
        super(avoidDuplicates);
        Utils.assert(1 <= moveLength && moveLength <= 3, 'Diaballik moves should be of length [1,3]');
    }

    /**
     * Implemented similarly as DiaballikMoveGenerator, but only generates moves containing exactly 3 sub moves.
     */
    public override getListMoves(node: DiaballikNode): DiaballikMove[] {
        const emptyMove: DiaballikMoveInConstruction =
            new DiaballikMoveInConstruction([], node.gameState, node.gameState);
        let movesInConstruction: DiaballikMoveInConstruction[] = [emptyMove];
        for (let i: number = 0; i < this.moveLength; i++) {
            let nextMovesInConstruction: DiaballikMoveInConstruction[] = [];
            for (const move of movesInConstruction) {
                nextMovesInConstruction = nextMovesInConstruction.concat(this.addAllPossibleSubMoves(move));
            }
            movesInConstruction = nextMovesInConstruction;
        }

        return movesInConstruction.map(DiaballikMoveInConstruction.finalize);
    }
}
