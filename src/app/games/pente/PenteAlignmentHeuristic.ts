import { MGPOptional } from '@everyboard/lib';

import { BoardValue } from '../../jscaip/AI/BoardValue';
import { Heuristic } from '../../jscaip/AI/Minimax';
import { PenteConfig } from './PenteConfig';
import { PenteMove } from './PenteMove';
import { PenteNode, PenteRules } from './PenteRules';
import { PenteState } from './PenteState';

export class PenteAlignmentHeuristic extends Heuristic<PenteMove, PenteState, BoardValue, PenteConfig> {

    public getBoardValue(node: PenteNode, config: MGPOptional<PenteConfig>): BoardValue {
        return PenteRules
            .get()
            .getHelper(config.get())
            .getBoardValue(node.gameState);
    }

}
