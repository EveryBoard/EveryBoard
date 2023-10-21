import { DiaballikMove } from './DiaballikMove';
import { DiaballikMoveGenerator, DiaballikMoveInConstruction } from './DiaballikMoveGenerator';
import { DiaballikNode } from './DiaballikRules';

export class DiaballikFilteredMoveGenerator extends DiaballikMoveGenerator {

    /**
     * Implemented similarly as DiaballikMoveGenerator, but only generates moves containing exactly 3 sub moves.
     */
    public override getListMoves(node: DiaballikNode): DiaballikMove[] {
        const emptyMove: DiaballikMoveInConstruction =
            new DiaballikMoveInConstruction([], node.gameState, node.gameState);
        let movesInConstruction: DiaballikMoveInConstruction[] = [emptyMove];
        for (let i: number = 0; i < 3; i++) {
            let nextMovesInConstruction: DiaballikMoveInConstruction[] = [];
            for (const move of movesInConstruction) {
                nextMovesInConstruction = nextMovesInConstruction.concat(this.addAllPossibleSubMoves(move));
            }
            movesInConstruction = nextMovesInConstruction;
        }

        return movesInConstruction.map(DiaballikMoveInConstruction.finalize);
    }
}
