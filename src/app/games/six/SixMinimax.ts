import { Minimax } from '../../jscaip/AI/Minimax';

import { SixFilteredMoveGenerator } from './SixFilteredMoveGenerator';
import { SixHeuristic } from './SixHeuristic';
import { SixMove } from './SixMove';
import { SixConfig, SixLegalityInformation, SixRules } from './SixRules';
import { SixState } from './SixState';

export class SixMinimax extends Minimax<SixMove, SixState, SixConfig, SixLegalityInformation> {

    public constructor() {
        const rules: SixRules = SixRules.get();
        super($localize`Minimax`, rules, new SixHeuristic(), new SixFilteredMoveGenerator(rules));
    }

}
