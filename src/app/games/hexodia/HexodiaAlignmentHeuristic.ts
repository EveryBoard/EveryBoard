import { BoardValue } from '../../jscaip/AI/BoardValue';
import { Heuristic } from '../../jscaip/AI/Heuristic';
import { FourStatePieceGameStateWithTable } from '../../jscaip/state/FourStatePieceGameStateWithTable';

import { HexodiaMove } from './HexodiaMove';
import { HexodiaConfig, HexodiaNode, HexodiaRules } from './HexodiaRules';

export class HexodiaAlignmentHeuristic extends Heuristic<HexodiaMove,
                                                         FourStatePieceGameStateWithTable,
                                                         BoardValue,
                                                         HexodiaConfig>
{
    public getBoardValue(node: HexodiaNode, config: HexodiaConfig): BoardValue {
        const state: FourStatePieceGameStateWithTable = node.gameState;
        let score: number = 0;
        for (const coordAndContent of state.getPlayerCoordsAndContent()) {
            const squareScore: number = HexodiaRules
                .getHexodiaHelper(config)
                .getSquareScore(state, coordAndContent.coord);
            score += squareScore;
        }
        return BoardValue.of(score);
    }

}
