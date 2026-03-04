import { Minimax } from '../../jscaip/AI/Minimax';

import { PenteAlignmentHeuristic } from './PenteAlignmentHeuristic';
import { PenteConfig } from './PenteConfig';
import { PenteMove } from './PenteMove';
import { PenteMoveGenerator } from './PenteMoveGenerator';
import { PenteRules } from './PenteRules';
import { PenteState } from './PenteState';

export class PenteAlignmentMinimax extends Minimax<PenteMove, PenteState, PenteConfig> {

    public constructor() {
        super($localize`Alignment`,
              PenteRules.get(),
              new PenteAlignmentHeuristic(),
              new PenteMoveGenerator());
    }

}
