import { Heuristic } from 'src/app/jscaip/AI/Minimax';
import { TeekoMove } from './TeekoMove';
import { TeekoState } from './TeekoState';
import { TeekoNode, TeekoRules } from './TeekoRules';
import { BoardValue } from 'src/app/jscaip/AI/BoardValue';
import { Coord } from 'src/app/jscaip/Coord';

export class TeekoHeuristic extends Heuristic<TeekoMove, TeekoState> {

    public getBoardValue(node: TeekoNode): BoardValue {
        const alignmentPossibilities: number = TeekoRules.TEEKO_HELPER.getBoardValue(node.gameState).value;
        const squarePossibilities: { score: number; victoriousCoords: Coord[] } =
            TeekoRules.get().getSquareInfo(node.gameState);
        return new BoardValue(squarePossibilities.score + alignmentPossibilities);
    }
}
