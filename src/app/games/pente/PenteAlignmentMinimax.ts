import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { PenteConfig } from './PenteConfig';
import { PenteMove } from './PenteMove';
import { PenteMoveGenerator } from './PenteMoveGenerator';
import { PenteRules } from './PenteRules';
import { PenteAlignmentHeuristic } from './PenteAlignmentHeuristic';
import { PenteState } from './PenteState';

export class PenteAlignmentMinimax extends Minimax<PenteMove, PenteState, PenteConfig> {

    public constructor() {
        super($localize`Alignment`,
              PenteRules.get(),
              new PenteAlignmentHeuristic(),
              new PenteMoveGenerator());
    }

}
