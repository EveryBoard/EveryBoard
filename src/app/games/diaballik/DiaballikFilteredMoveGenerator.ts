import { DiaballikMove } from './DiaballikMove';
import { DiaballikMoveGenerator, DiaballikMoveInConstruction } from './DiaballikMoveGenerator';
import { DiaballikNode } from './DiaballikRules';

export class DiaballikFilteredMoveGenerator extends DiaballikMoveGenerator {

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

        function finalize(m: DiaballikMoveInConstruction): DiaballikMove {
            return m.finalize();
        }
        return movesInConstruction.map(finalize);
    }
}
