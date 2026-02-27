import { Minimax } from '../../jscaip/AI/Minimax';

import { SiamHeuristic } from './SiamHeuristic';
import { SiamMove } from './SiamMove';
import { SiamMoveGenerator } from './SiamMoveGenerator';
import { SiamConfig, SiamLegalityInformation, SiamRules } from './SiamRules';
import { SiamState } from './SiamState';

export class SiamMinimax extends Minimax<SiamMove, SiamState, SiamConfig, SiamLegalityInformation> {

    public constructor() {
        super($localize`Minimax`,
              SiamRules.get(),
              new SiamHeuristic(),
              new SiamMoveGenerator(),
        );
    }
}
