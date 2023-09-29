import { ConspirateursMove } from './ConspirateursMove';
import { ConspirateursMoveGenerator } from './ConspirateursMoveGenerator';
import { ConspirateursNode } from './ConspirateursRules';

export class ConspirateursOrderedMoveGenerator extends ConspirateursMoveGenerator {

    public override getListMoves(node: ConspirateursNode): ConspirateursMove[] {
        return this.sortByNumberOfJumps(super.getListMoves(node));
    }
    public sortByNumberOfJumps(moves: ConspirateursMove[]): ConspirateursMove[] {
        return moves.sort((a: ConspirateursMove, b: ConspirateursMove) => {
            const leftSize: number =
                ConspirateursMove.isDrop(a) ? 1 : (ConspirateursMove.isSimple(a) ? 2 : a.coords.length);
            const rightSize: number =
                ConspirateursMove.isDrop(b) ? 1 : (ConspirateursMove.isSimple(b) ? 2 : b.coords.length);
            return rightSize - leftSize;
        });
    }
}
