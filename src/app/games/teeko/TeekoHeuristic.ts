import { Heuristic } from 'src/app/jscaip/AI/Minimax';
import { TeekoMove } from './TeekoMove';
import { TeekoState } from './TeekoState';
import { BoardValue } from 'src/app/jscaip/AI/BoardValue';
import { TeekoConfig, TeekoNode, TeekoRules } from './TeekoRules';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class TeekoHeuristic extends Heuristic<TeekoMove, TeekoState, BoardValue, TeekoConfig> {

    public getBoardValue(node: TeekoNode, _config: MGPOptional<TeekoConfig>): BoardValue {
        const alignmentPossibilities: number = TeekoRules.TEEKO_HELPER.getBoardValue(node.gameState).value[0];
        const squarePossibilities: { score: number; victoriousCoords: Coord[] } =
            TeekoRules.get().getSquareInfo(node.gameState);
        return new BoardValue([squarePossibilities.score + alignmentPossibilities]);
    }
}
