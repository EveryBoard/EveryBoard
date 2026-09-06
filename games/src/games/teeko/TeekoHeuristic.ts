import { BoardValue } from '../../jscaip/AI/BoardValue';
import { Heuristic } from '../../jscaip/AI/Heuristic';
import { Coord } from '../../jscaip/Coord';

import { TeekoMove } from './TeekoMove';
import { TeekoConfig, TeekoNode, TeekoRules } from './TeekoRules';
import { TeekoState } from './TeekoState';

export class TeekoHeuristic extends Heuristic<TeekoMove,
                                              TeekoState,
                                              BoardValue,
                                              TeekoConfig>
{

    public getBoardValue(node: TeekoNode, _config: TeekoConfig): BoardValue {
        const alignmentPossibilities: number = TeekoRules.TEEKO_HELPER.getBoardValue(node.gameState).metrics[0];
        const squarePossibilities: { score: number; victoriousCoords: Coord[] } =
            TeekoRules.get().getSquareInfo(node.gameState);
        return BoardValue.of(squarePossibilities.score + alignmentPossibilities);
    }

}
