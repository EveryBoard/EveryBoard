import { BoardValue } from '../../jscaip/AI/BoardValue';
import { Heuristic } from '../../jscaip/AI/Heuristic';

import { PenteConfig } from './PenteConfig';
import { PenteMove } from './PenteMove';
import { PenteNode, PenteRules } from './PenteRules';
import { PenteState } from './PenteState';

export class PenteAlignmentHeuristic extends Heuristic<PenteMove, PenteState, BoardValue, PenteConfig> {

    public getBoardValue(node: PenteNode, config: PenteConfig): BoardValue {
        return PenteRules
            .get()
            .getHelper(config)
            .getBoardValue(node.gameState);
    }

}
