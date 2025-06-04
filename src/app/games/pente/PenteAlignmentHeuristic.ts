import { MGPOptional } from '@everyboard/lib';

import { BoardValue } from '../../../app/jscaip/AI/BoardValue';
import { Heuristic } from '../../../app/jscaip/AI/Minimax';
import { PenteMove } from './PenteMove';
import { PenteNode, PenteRules } from './PenteRules';
import { PenteState } from './PenteState';
import { PenteConfig } from './PenteConfig';

export class PenteAlignmentHeuristic extends Heuristic<PenteMove, PenteState, BoardValue, PenteConfig> {

    public getBoardValue(node: PenteNode, config: MGPOptional<PenteConfig>): BoardValue {
        return PenteRules
            .get()
            .getHelper(config.get())
            .getBoardValue(node.gameState);
    }

}
